import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel, PostsModel, CommentsModel } from '../models';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userId = '58f9c2502d4581000484b18a';
const messageData = 'messageData';
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


describe('RootCreateCommentMutation', () => {
  beforeEach(async () => {
    // setup db
    // try {
    const user = new UsersModel(userData);
    await user.save();
  });
  test('should create new post request', async () => {
    // language=GraphQL
    const query = `
      {
        createNewPost(message:${messageData}) {
          user
          message
         
        }
      }
    `;
    const rootValue = {
      request: {
        user: { userId },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.createNewPost).toEqual(Object.assign({}, {
      user: userId,
      message: messageData,
    }));
  });
  test('should check userId undefined', async () => {
    const query = `
      mutation M {
        createNewPost(message:${messageData}) {
          user
          message
        }
      }
    `;
    const rootValue = {
      request: {
        user: {},
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.createNewPost).toEqual(null);
    expect(result.errors[0].message).toEqual('userId is undefined');
  });
  test('should check message undefind', async () => {
    const query = `
      mutation M {
        createNewPost {
          _id
        }
      }
    `;
    const rootValue = {
      request: {
        user: { userId },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data).toEqual(undefined);
    expect(result.errors[0].message).toEqual('Field "createNewPost" argument "_id" of type "String!" is required but not provided.');
  });
  afterEach(async () => {
    // clear data
    await UsersModel.remove({});
  });
});
