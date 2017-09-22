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
const buildingId = '58da279f0ff5af8c8be59c36';
const userDataA = {
  _id: userIdA,
  email: {
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
  _id: '59c3895b9a85302d66403c29',
  friend: userIdB,
  user: userIdA,
  status: 'ACCEPTED',
  isSubscribe: true,
  __v: 0,
};

const friendsRelationDataB = {
  _id: '59c48458e229ac1836eca63b',
  friend: userIdA,
  user: userIdB,
  status: 'ACCEPTED',
  isSubscribe: true,
  __v: 0,
};

describe('RootSendUnfriendRequestMutation', () => {
  beforeEach(async () => {
    // setup db
    const userA = new UsersModel(userDataA);
    await userA.save();
    const userB = new UsersModel(userDataB);
    await userB.save();

    const friendsRelation = new FriendsRelationModel(friendsRelationData);
    await friendsRelation.save();
    const friendsRelationB = new FriendsRelationModel(friendsRelationDataB);
    await friendsRelationB.save();
  });

  test('should get friend data', async () => {
    const query = `
      mutation M { 
        sendUnfriendRequest(_id:"${userIdB}") {
          _id
          profile {
            picture
            firstName
            lastName
          }
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
    expect(result.data.sendUnfriendRequest).toEqual(Object.assign({}, {
      _id: userDataB._id,
      profile: {
        picture: userDataB.profile.picture,
        firstName: userDataB.profile.firstName,
        lastName: userDataB.profile.lastName,
      },
    }));
    expect(await FriendsRelationModel.count()).toEqual(0);
    // await new Promise(resolve => setTimeout(resolve, 5000));
  });

  test('should check friendId undefined', async () => {
    const query = `
      mutation M {
        sendUnfriendRequest {
          _id
          profile {
            picture
            firstName
            lastName
          }
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
    expect(result.errors[0].message).toEqual('Field "sendUnfriendRequest" argument "_id" of type "String!" is required but not provided.');
  });

  test('should check userId undefind', async () => {
    const query = `
      mutation M {
        sendUnfriendRequest(_id:"${userIdB}") {
          _id
          profile {
            picture
            firstName
            lastName
          }
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
    expect(result.data.sendUnfriendRequest).toEqual(null);
    expect(result.errors[0].message).toEqual('userId is undefined');
  });

  test('should check userId not exist', async () => {
    const query = `
      mutation M { 
        sendUnfriendRequest(_id:"${userIdB}") {
          _id
          profile {
            picture
            firstName
            lastName
          }
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
    expect(result.data.sendUnfriendRequest).toEqual(null);
    expect(result.errors[0].message).toEqual('userId does not exist');
  });

  test('should check friendId not exist', async () => {
    const fakeId = '58f9ca042d4581000474b109';
    const query = `
      mutation M { 
        sendUnfriendRequest(_id:"${fakeId}") {
          _id
          profile {
            picture
            firstName
            lastName
          }
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
    expect(result.data.sendUnfriendRequest).toEqual(null);
    expect(result.errors[0].message).toEqual('friendId does not exist');
  });

  afterEach(async () => {
    // clear data
    await UsersModel.remove({});
    await FriendsRelationModel.remove({});
  });
});
