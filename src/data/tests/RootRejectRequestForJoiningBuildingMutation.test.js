import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { BuildingsModel, BuildingMembersModel, UsersModel } from '../models';
import { ADMIN, REJECTED, ACCEPTED, MEMBER, PENDING } from '../../constants';
import { buildingData as bd } from './data';
// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const buildingId = '58da279f0ff5af8c8be59c37';
const buildingData = Object.assign({
  _id: buildingId,
}, bd);

const apartmentIdA = '57c9c1bf2d4581000484b189';
const apartmentIdB = '58f9c1bf2d4581000484b123';

const userIdA = '58f9c2502d4581000474b19a';
const userIdB = '58f9c1bf2d4581000474b198';
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

describe('RootRejectRequestForJoiningBuildingMutation', () => {
  beforeEach(async () => {
    // setup db
    try {
      const building = new BuildingsModel(buildingData);
      await building.save();
      const userA = new UsersModel(userDataA);
      await userA.save();
      const userB = new UsersModel(userDataB);
      await userB.save();
      await BuildingMembersModel.create({
        building: buildingId,
        user: userIdA,
        type: ADMIN,
        status: ACCEPTED,
        requestInformation: {
          apartments: [apartmentIdA],
        },
      });
      await BuildingMembersModel.create({
        building: buildingId,
        user: userIdB,
        type: MEMBER,
        status: PENDING,
        requestInformation: {
          apartments: [apartmentIdB],
        },
      });
      // await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (e) {
      console.log(e);
    }
  });

  test('should get error if user is not admin', async () => {
    // language=GraphQL
    const query = `
      mutation M { 
        rejectRequestForJoiningBuilding(buildingId:"${buildingId}",userId:"${userIdB}") {
          _id
          username
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
    expect(result.data.rejectRequestForJoiningBuilding).toEqual(null);
    expect(result.errors[0].message).toEqual('you don\'t have permission to reject request');
  });

  test('should get error if request not found', async () => {
    // language=GraphQL
    const query = `
      mutation M { 
        rejectRequestForJoiningBuilding(buildingId:"${buildingId}",userId:"${userIdA}") {
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
    expect(result.data.rejectRequestForJoiningBuilding).toEqual(null);
    expect(result.errors[0].message).toEqual('not found the request');
  });

  test('should get error if request not found', async () => {
    // language=GraphQL
    const query = `
      mutation M { 
        rejectRequestForJoiningBuilding(buildingId:"${buildingId}",userId:"58da279f0ff5af8c8be59c42") {
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
    expect(result.data.rejectRequestForJoiningBuilding).toEqual(null);
    expect(result.errors[0].message).toEqual('User not found.');
  });

  test('should get user data', async () => {
    // language=GraphQL
    const query = `
      mutation M { 
        rejectRequestForJoiningBuilding(buildingId:"${buildingId}",userId:"${userIdB}") {
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
    await new Promise(resolve => setTimeout(resolve, 5000));
    expect(result.data.rejectRequestForJoiningBuilding).toEqual({
      _id: userIdB,
      username: userDataB.username,
    });
    expect(await BuildingMembersModel.count({
      building: buildingId,
      user: userIdB,
      type: MEMBER,
      status: REJECTED,
    })).toEqual(1);
    // await new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve();
    //   }, 5000);
    // });
  });

  afterEach(async () => {
    // clear data
    await BuildingsModel.remove({
      _id: buildingData._id,
    });
    await UsersModel.remove({});
    await BuildingMembersModel.remove({});
  });
});
