import { graphql } from 'graphql';
// import isUndefined from 'lodash/isUndefined';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel, PostsModel } from '../models';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const postId = '58f9c2502d4581000474b19a';
const postData = {

  _id: postId,
  createdAt: '2017-04-28T09:51:38.873Z',
  updatedAt: '2017-04-28T09:51:38.873Z',
  message: '{"entityMap":{},"blocks":[{"key":"8cboc","text":"dsadsadsa","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]}',
  user: '58f9c3d52d4581000484b194',
  likes: [],
  photos: [],
  type: 'STATUS',
  __v: 0,

};

describe('RootLikePostMutation', () => {
  beforeEach(async () => {
    // setup db
    const postModel = new UsersModel(postData);
    await postModel.save();
  });

  test('should like Post request', async () => {
    const query = `
      mutation M { 
        likePost(_id:"${userIdC}") {
          _id
          username
        }
      }
    `;
    const rootValue = {
      request: {
        user: {
          id: userIdA,
        },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.sendFriendRequest).toEqual(Object.assign({}, {
      _id: userDataC._id,
      username: userDataC.username,
    }));
    expect(await FriendsRelationModel.count()).toEqual(1);
  });

  test('should check friendId undefined', async () => {
    const query = `
      mutation M {
        sendFriendRequest {
          _id
          username
        }
      }
    `;
    const rootValue = {
      request: {
        user: { id: userIdA },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data).toEqual(undefined);
    expect(result.errors[0].message).toEqual('Field "sendFriendRequest" argument "_id" of type "String!" is required but not provided.');
  });
  test('should check userId undefind', async () => {
    const query = `
      mutation M {
        sendFriendRequest(_id:"${userIdC}") {
          _id
          username
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
    expect(result.data.sendFriendRequest).toEqual(null);
    expect(result.errors[0].message).toEqual('userId is undefined');
  });
  test('should check userId not exist', async () => {
    const query = `
      mutation M { 
        sendFriendRequest(_id:"${userIdC}") {
          _id
          username
        }
      }
    `;
    const rootValue = {
      request: {
        user: { id: '58f9ca042d4581000474b109' },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.sendFriendRequest).toEqual(null);
    expect(result.errors[0].message).toEqual('userId does not exist');
  });
  test('should check friendId not exist', async () => {
    const fakeId = '58f9ca042d4581000474b109';
    const query = `
      mutation M { 
        sendFriendRequest(_id:"${fakeId}") {
          _id
          username
        }
      }
    `;
    const rootValue = {
      request: {
        user: { id: userIdA },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.sendFriendRequest).toEqual(null);
    expect(result.errors[0].message).toEqual('friendId does not exist');
  });

  afterEach(async () => {
    // clear data
    await PostsModel.remove({
      _id: { $in: [postId] },
    });
  });
});
