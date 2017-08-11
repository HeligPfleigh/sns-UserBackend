import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel, BuildingsModel, ApartmentsModel, FriendsRelationModel } from '../models';
import { buildingData as bd } from './data';
// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userIdA = '58f9c2502d4581000484b18a';
const userIdB = '58f9c1bf2d4581000484b188';
const userIdC = '58f9ca042d4581000484b197';
const userIdD = '58f9ca123d4581000484b197';
const userIdE = '58f9ca657d4581000484b197';
const userIdF = '58f9ca823d4581000484b197';

const buildingId = '58da279f0ff5af8c8be59c36';
const apartmentIdA = '57c9c1bf2d4581000484b189';
const apartmentIdB = '58f9c1bf2d4581000484b123';
const apartmentIdC = '59a9c1bf2d4581000484b323';

const buildingData = Object.assign({}, bd, {
  _id: buildingId,
});

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

const apartmentDataA = {
  _id: apartmentIdA,
  prefix: 'P',
  number: '27',
  name: 'name',
  building: buildingId,
  owner: userIdA,
  users: [userIdD],
  isOwner: true,
  __v: 0,
};

const apartmentDataB = {
  _id: apartmentIdB,
  prefix: 'P',
  number: '28',
  name: 'name',
  building: buildingId,
  owner: userIdB,
  users: [userIdE],
  isOwner: true,
  __v: 0,
};

const apartmentDataC = {
  _id: apartmentIdC,
  prefix: 'P',
  number: '29',
  name: 'name',
  building: buildingId,
  owner: userIdC,
  users: [userIdF],
  isOwner: true,
  __v: 0,
};

const friendsRelationData = {
  _id: '58f9c2828259b01965387c89',
  friend: userIdE,
  user: userIdF,
  status: 'PENDING',
  isSubscribe: true,
  __v: 0,
};

describe('RootFriendSuggestionsQuery', () => {
  beforeEach(async () => {
    // setup db
    const userA = new UsersModel(userDataA);
    await userA.save();
    const userB = new UsersModel(userDataB);
    await userB.save();
    const userC = new UsersModel(userDataC);
    await userC.save();

    const building = new BuildingsModel(buildingData);
    await building.save();

    const apartmentA = new ApartmentsModel(apartmentDataA);
    await apartmentA.save();
    const apartmentB = new ApartmentsModel(apartmentDataB);
    await apartmentB.save();
    const apartmentC = new ApartmentsModel(apartmentDataC);
    await apartmentC.save();

    const friendsRelation = new FriendsRelationModel(friendsRelationData);
    await friendsRelation.save();
  });
  test('should get users in building', async () => {
    const query = `
      {
        resident (_id:"${userIdA}") {
          _id
          friendSuggestions (cursor: null, limit: 5) {
            pageInfo {
              endCursor
              hasNextPage
              total
              limit
            }
            edges {
              _id
              profile {
                firstName
                lastName
                picture
              }
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = getContext({
      user: {
        id: userIdA,
      },
    });
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.resident.friendSuggestions.edges).toEqual([
      {
        _id: userIdB,
        profile: {
          firstName: userDataB.profile.firstName,
          lastName: userDataB.profile.lastName,
          picture: userDataB.profile.picture,
        },
      },
      {
        _id: userIdC,
        profile: {
          firstName: userDataC.profile.firstName,
          lastName: userDataC.profile.lastName,
          picture: userDataC.profile.picture,
        },
      },
    ]);
  });

  test('should throw error if user is not me', async () => {
    const query = `
      {
        resident (_id:"${userIdA}") {
          _id
          friendSuggestions (cursor: null, limit: 5) {
            pageInfo {
              endCursor
              hasNextPage
              total
              limit
            }
            edges {
              _id
              profile {
                firstName
                lastName
                picture
              }
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = getContext({
      user: {
        id: userIdB,
      },
    });
    const result = await graphql(schema, query, rootValue, context);
    expect(result.errors[0].message).toEqual('you dont have permission to access friendSuggestions');
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 5000);
    });
  });

  afterEach(async () => {
    // clear data
    await UsersModel.remove({});
    await BuildingsModel.remove({});
    await ApartmentsModel.remove({});
    await FriendsRelationModel.remove({});
  });
});
