import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import { PUBLIC, FRIEND, ONLY_ME } from '../../constants';
import schema from '../schema';
import { UsersModel, FriendsRelationModel } from '../models';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userId = '58f9c1bf2d4581000474b198';
const userIdB = '58f9c1bf2d4581000484b188';
const messageData = 'message Data';
const buildingId = '58da279f0ff5af8c8be59c36';
const userDataA = {
  _id: userId,
  email: {
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

const userDataB = {
  _id: userIdB,
  email: {
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

const friendsRelationData = {
  _id: '58f9c3ac2d4581000484b193',
  user: userIdB,
  friend: userId,
  isSubscribe: true,
  status: 'ACCEPTED',
  __v: 0,
};

describe('RootCreateNewPostMutation', () => {
  beforeEach(async () => {
    // setup db
    const user = new UsersModel(userDataA);
    await user.save();
    const userB = new UsersModel(userDataB);
    await userB.save();
  });

  test('should create new post request', async () => {
    // language=GraphQL
    const friendsRelation = new FriendsRelationModel(friendsRelationData);
    await friendsRelation.save();
    let query = `
      mutation M { 
        createNewPost(message:"${messageData}") {
          user {
            _id
          }
          message
          privacy
        }
      }
    `;
    const rootValue = {
      request: {
        user: { id: userId },
      },
    };
    const context = getContext({});
    let result = await graphql(schema, query, rootValue, context);
    expect(result.data.createNewPost).toEqual(Object.assign({}, {
      user: {
        _id: userId,
      },
      message: messageData,
      privacy: PUBLIC,
    }));

    query = `
      mutation M { 
        createNewPost(message:"${messageData}",privacy:${FRIEND}) {
          user {
            _id
          }
          message
          privacy
        }
      }
    `;
    result = await graphql(schema, query, rootValue, context);
    expect(result.data.createNewPost).toEqual(Object.assign({}, {
      user: {
        _id: userId,
      },
      message: messageData,
      privacy: FRIEND,
    }));

    query = `
      mutation M { 
        createNewPost(message:"${messageData}",privacy:${ONLY_ME}) {
          user {
            _id
          }
          message
          privacy
        }
      }
    `;
    result = await graphql(schema, query, rootValue, context);
    expect(result.data.createNewPost).toEqual(Object.assign({}, {
      user: {
        _id: userId,
      },
      message: messageData,
      privacy: ONLY_ME,
    }));
    await friendsRelation.remove({});
  });

  test('should create new post on other wall', async () => {
    const friendsRelation = new FriendsRelationModel(friendsRelationData);
    await friendsRelation.save();
    // language=GraphQL
    const query = `
      mutation M { 
        createNewPost(message:"${messageData}",userId: "${userIdB}") {
          user {
            _id
          }
          message
          privacy
        }
      }
    `;
    const rootValue = {
      request: {
        user: { id: userId },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.createNewPost).toEqual(Object.assign({}, {
      user: {
        _id: userIdB,
      },
      message: messageData,
      privacy: PUBLIC,
    }));
    await friendsRelation.remove({});
  });

  test('should check author undefined', async () => {
    const query = `
      mutation M {
        createNewPost(message:"${messageData}") {
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
    expect(result.errors[0].message).toEqual('author is undefined');
  });

  test('should check message undefined', async () => {
    const query = `
      mutation M {
        createNewPost {
          _id
        }
      }
    `;
    const rootValue = {
      request: {
        user: { id: userId },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data).toEqual(undefined);
    expect(result.errors[0].message).toEqual('Field "createNewPost" argument "message" of type "String!" is required but not provided.');
  });

  test('should throw error when message is empty string', async () => {
    const query = `
      mutation M {
        createNewPost(message:"    ") {
          _id
        }
      }
    `;
    const rootValue = {
      request: {
        user: { id: userId },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data).toEqual({
      createNewPost: null,
    });
    expect(result.errors[0].message).toEqual('you can not create a new post with empty message');
  });

  afterEach(async () => {
    // clear data
    await UsersModel.remove({});
  });
});
