import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { PostsModel, UsersModel } from '../models';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userId = '58f9c2502d4581023484b18a';
const postId = '58f9d6b62d4581000484b1a3';
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
  _id: postId,
  message: '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'Viet nam tuoi dep\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}',
  user: userId,
  author: userId,
  likes: [userId],
  photos: [],
  type: 'STATUS',
  __v: 0,
};

describe('RootPostQuery', () => {
  beforeEach(async () => {
    // setup db
    const user = new UsersModel(userData);
    await user.save();
    const post = new PostsModel(postData);
    await post.save();
  });
  test('should get post by id', async () => {
    // language=GraphQL
    const query = `
      {
        post (_id:"${postId}") {
          _id
          user {
            _id
            username
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
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.post._id.toString()).toBe(postData._id);
    expect(result.data.post.user).toEqual(Object.assign({}, {
      _id: userData._id,
      username: userData.username,
    }));
  });

  afterEach(async () => {
    // clear data
    await UsersModel.remove({
      _id: userData._id,
    });
    await PostsModel.remove({
      _id: postData._id,
    });
  });
});
