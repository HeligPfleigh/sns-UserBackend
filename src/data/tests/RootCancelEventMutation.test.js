import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel, PostsModel } from '../models';
import { PUBLIC, EVENT } from '../../constants';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userId = '58f9c2502d4581000474b19a';
const userIdB = '58f9c1bf2d4581000484b188';
const postId = '59bf7bb58e0a1e171fd3dc83';
const postIdB = '59af965cd7c4034c7fe296ba';
const buildingId = '58da279f0ff5af8c8be59c36';
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
  building: buildingId,
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

const userDataB = {
  _id: userIdB,
  emails: {
    address: 'particle4dev@gmail.com',
    verified: true,
  },
  username: 'particle4dev',
  profile: {
    picture: 'https://graph.facebook.com/596825810516199/picture?type=large',
    firstName: 'Nam',
    lastName: 'Hoang',
    gender: 'male',
  },
  building: buildingId,
  services: {
    facebook: {
      accessToken: 'EAAJpgxDr0K0BAADXzQ67vyDOb3owgMqhvQtze4QQm8dfLkH1Exnt6D3kPbKT6ZB11HyZADOiwkFwvpuHX1ZCVp2fKy63jONwh1UGKQiy7KvK6yzUSpfiIIz63RN4ZB8GNa8qIpxbnoXhV9CVgsMSqgMoRoi5Bi4ZD',
      tokenExpire: '2017-06-10T08:24:30.744Z',
    },
  },
  chatId: '4p4vIMzYwUhiFiqbBMggcbAItX03',
  roles: [
    'user',
  ],
  __v: 0,
};

const postData = {
  _id: postId,
  author: userId,
  name: 'su kien cua toi',
  location: 'vi tri cua toi',
  start: '2017-09-19T07:53:53.202Z',
  end: '2017-09-23T10:53:53.202Z',
  message: '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'Viet nam tuoi dep\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}',
  building: null,
  isCancelled: false,
  cant_joins: [],
  can_joins: [],
  joins: [],
  interests: [],
  invites: [],
  likes: [],
  photos: [
    'http://localhost:3005/images/1505721239125.png',
  ],
  privacy: PUBLIC,
  type: EVENT,
  __v: 0,
};

describe('RootCancelEventMutation', () => {
  beforeEach(async () => {
    // setup db
    const user = new UsersModel(userData);
    await user.save();
    const userB = new UsersModel(userDataB);
    await userB.save();

    const post = new PostsModel(postData);
    await post.save();
  });

  test('should cancel event if user is author', async () => {
    const query = `
      mutation cancelEventMutation { 
        cancelEvent(eventId: "${postId}") {
          _id
          isCancelled
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
    expect(result.data.cancelEvent).toEqual(Object.assign({}, {
      _id: postId,
      isCancelled: true,
    }));
    // await new Promise(resolve => setTimeout(resolve, 5000));
  });

  test('throw error if user is not author', async () => {
    const query = `
      mutation cancelEventMutation { 
        cancelEvent(eventId: "${postId}") {
          _id
          isCancelled
        }
      }
    `;
    const rootValue = {
      request: {
        user: {
          id: userIdB,
        },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.errors[0].message).toEqual('not found the post');
    // await new Promise(resolve => setTimeout(resolve, 5000));
  });

  test('throw error if not found post', async () => {
    const query = `
      mutation cancelEventMutation { 
        cancelEvent(eventId: "${postIdB}") {
          _id
          isCancelled
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
    expect(result.errors[0].message).toEqual('not found the post');
    // await new Promise(resolve => setTimeout(resolve, 5000));
  });

  afterEach(async () => {
    // clear data
    await UsersModel.remove({});
    await PostsModel.remove({});
  });
});
