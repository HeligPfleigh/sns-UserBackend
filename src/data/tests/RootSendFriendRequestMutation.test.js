import { graphql } from 'graphql';
// import isUndefined from 'lodash/isUndefined';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel, FriendsRelationModel } from '../models';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userIdA = '58f9c2502d4581000474b19a';
const userIdB = '58f9c1bf2d4581000474b198';
const userIdC = '58f9ca042d4581000474b107';
const buildingId = '58da279f0ff5af8c8be59c36';
const userDataA = {
  _id: userIdA,
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

const userDataC = {
  _id: userIdC,
  emails: {
    address: 'thanhtt@gmail.com',
    verified: true,
  },
  username: 'thanhtt',
  profile: {
    picture: 'https://graph.facebook.com/10155107388459788/picture?type=large',
    firstName: 'Thanh',
    lastName: 'Tran Trung',
    gender: 'male',
  },
  building: buildingId,
  services: {
    facebook: {
      accessToken: 'EAAJpgxDr0K0BAKl9n9Mgelw8NMtmmLyJdKu88s0iyUBHyuJuUowITGLpPWgSLbD0tznv7XteIzx83cZBcKmzIqft3pqtWBcG4UCnQAFAnLHJOsLFm71CWVZAcoWEj1sq3AnZCZBdGMTgK6QJhm53pOOurGXPOB4ZD',
      tokenExpire: '2017-06-10T08:59:48.074Z',
    },
  },
  chatId: 'i3yXrXoLUCNthP7BaBr5dnU3fjt2',
  roles: [
    'user',
  ],
  __v: 0,
};

describe('RootSendFriendRequestMutation', () => {
  beforeEach(async () => {
    // setup db
    const userA = new UsersModel(userDataA);
    await userA.save();
    const userB = new UsersModel(userDataB);
    await userB.save();
    const userC = new UsersModel(userDataC);
    await userC.save();
  });

  test('should get Friend request', async () => {
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
        sendFriendRequest(_id:"") {
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
    expect(result.errors[0].message).toEqual('Argument passed in must be a single String of 12 bytes or a string of 24 hex characters');
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
    expect(result.errors[0].message).toEqual('userId does not exis1t');
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
    await UsersModel.remove({
      _id: { $in: [userIdA, userIdB, userIdC] },
    });
    await FriendsRelationModel.remove({});
  });
});
