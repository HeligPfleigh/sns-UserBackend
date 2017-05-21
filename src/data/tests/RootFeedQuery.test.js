import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import { PostsModel, UsersModel } from '../models';
import schema from '../schema';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userId = '58f9c2502d4581000484b18a';
const userData = {
  _id: userId,
  emails: {
    address: 'muakhoc90@gmail.com',
    verified: true,
  },
  username: 'muakhoc90',
  profile: {
    picture: 'https://graph.facebook.com/144057672785233/picture?type=large',
    firstName: 'Duc',
    lastName: 'Linh',
    gender: 'male',
  },
  building: '58da279f0ff5af8c8be59c36',
  services: {
    facebook: {
      accessToken: 'EAAJpgxDr0K0BAB2MGE0qk7ErupQ1iRRt6NE4zLeZA4M2852kYgmFVoVexNb3AmsqrkDdFA1TgVk6ekKzRE2nYaGBgjhlPMNEkwtUuvcZAZCIPILdWVBvSPrERxYLHMHJsccSradePPGajydwAonMvW5ciCoknUZD',
      tokenExpire: '2017-06-10T08:26:55.931Z',
    },
  },
  chatId: 'cLq7UcjYopQ5tLGmiR9nnHaKzIR2',
  roles: ['user'],
  __v: 0,
};

const postData = {
  message: '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'Viet nam tuoi dep\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}',
  user: userId,
  author: userId,
  likes: ['58f9d2132d4581000484b1a0'],
  photos: [],
  type: 'STATUS',
  __v: 0,
};

describe('RootFeedQuery', () => {
  beforeEach(async () => {
    // setup db
    const user = new UsersModel(userData);
    await user.save();
    let post = null;
    for (let i = 10; i > 0; i--) {
      postData.message = `message${i}`;
      post = new PostsModel(postData);
      await post.save();
    }
  });
  test('should get post by id', async () => {
    let query = `
      {
        feed {
          edges {
            _id
            message
          }
          pageInfo {
            total
            limit
            endCursor
            hasNextPage
          }
        }
      }
    `;

    const rootValue = {
      request: {
        user: {
          id: userId,
        },
      },
    };
    const context = getContext({});
    let result = await graphql(schema, query, rootValue, context);
    let messages = result.data.feed.edges.map(m => m.message);
    expect(result.data.feed.pageInfo.total).toEqual(10);
    expect(result.data.feed.pageInfo.limit).toEqual(5);
    expect(result.data.feed.pageInfo.hasNextPage).toEqual(true);
    expect(result.data.feed.edges.length).toEqual(5);
    expect(messages).toEqual([
      'message1', 'message2', 'message3', 'message4', 'message5',
    ]);

    query = `
      {
        feed (cursor: "${result.data.feed.pageInfo.endCursor}") {
          edges {
            _id
            message
          }
          pageInfo {
            total
            limit
            endCursor
            hasNextPage
          }
        }
      }
    `;
    result = await graphql(schema, query, rootValue, context);
    messages = result.data.feed.edges.map(m => m.message);
    expect(messages).toEqual([
      'message6', 'message7', 'message8', 'message9', 'message10',
    ]);
  });

  afterEach(async () => {
    // clear data
  });
});
