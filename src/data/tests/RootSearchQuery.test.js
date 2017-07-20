import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel, FriendsRelationModel } from '../models';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userIdA = '58f9c2502d4581023484b18a';
const userIdB = '58f9c1bf2d4581000484b188';
const userIdC = '58f9ca042d4581000484b197';
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
  building: '58da279f0ff5af8c8be59c36',
  services: {
    facebook: {
      accessToken: 'EAAJpgxDr0K0BAB2MGE0qk7ErupQ1iRRt6NE4zLeZA4M2852kYgmFVoVexNb3AmsqrkDdFA1TgVk6ekKzRE2nYaGBgjhlPMNEkwtUuvcZAZCIPILdWVBvSPrERxYLHMHJsccSradePPGajydwAonMvW5ciCoknUZD',
      tokenExpire: '2017-06-10T08:26:55.931Z',
    },
  },
  chatId: 'cLq7UcjYopQ5tLGmiR9nnHaKzIR2',
  roles: ['user'],
  search: 'Duc Linh Duc Linh  D u c Du c  L i n h Li nh Lin h',
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
  building: '58da279f0ff5af8c8be59c36',
  services: {
    facebook: {
      accessToken: 'EAAJpgxDr0K0BAADXzQ67vyDOb3owgMqhvQtze4QQm8dfLkH1Exnt6D3kPbKT6ZB11HyZADOiwkFwvpuHX1ZCVp2fKy63jONwh1UGKQiy7KvK6yzUSpfiIIz63RN4ZB8GNa8qIpxbnoXhV9CVgsMSqgMoRoi5Bi4ZD',
      tokenExpire: '2017-06-10T08:24:30.744Z',
    },
  },
  chatId: '4p4vIMzYwUhiFiqbBMggcbAItX03',
  roles: ['user'],
  __v: 0,
  search: 'Nam Hoang Nam Hoang  N a m Na m  H o a n g Ho an g Hoa ng Hoan g',
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
  search: 'Thanh Tran Trung Thanh Tran Trung  T h a n h Th an h Tha nh Than h  T r a n Tr an Tra n  T r u n g Tr un g Tru ng Trun g',
};

const friendsRelationData = {
  _id: '58f9c3ac2d4581000484b193',
  user: userIdA,
  friend: userIdC,
  isSubscribe: true,
  status: 'ACCEPTED',
  __v: 0,
};

describe('RootPostQuery', () => {
  beforeEach(async () => {
    // setup db
    const userA = new UsersModel(userDataA);
    await userA.save();
    const userB = new UsersModel(userDataB);
    await userB.save();
    const userC = new UsersModel(userDataC);
    await userC.save();
    const friendsRelation = new FriendsRelationModel(friendsRelationData);
    await friendsRelation.save();
  });
  test('Get user in list friends by keyword', async () => {
    // language=GraphQL
    const keywordA = 'th';
    const query = `
      {
        search (keyword: "${keywordA}"){
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
    const item = result.data.search[0];
    expect(item).toEqual(Object.assign({}, {
      _id: userIdC,
      profile: {
        picture: userDataC.profile.picture,
        firstName: userDataC.profile.firstName,
        lastName: userDataC.profile.lastName,
      },
    }));
  });

  test('No user matched the keyword in my name', async () => {
    // language=GraphQL
    const keywordB = 'za';
    const query = `
      {
        search (keyword: "${keywordB}"){
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
          id: userIdB,
        },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.search).toEqual([]);
  });

  test('No user matched the keyword when user in different building ', async () => {
    // language=GraphQL
    await UsersModel.update({
      _id: userIdC,
    }, {
      $set: {
        building: '58da279f0ff5af8c8be59c70',
      },
    });
    const keywordA = 'th';
    const query = `
      {
        search (keyword: "${keywordA}"){
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
          id: userIdB,
        },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.search).toEqual([]);
  });

  afterEach(async () => {
    // clear data
    await UsersModel.remove({});
    await FriendsRelationModel.remove({});
  });
});
