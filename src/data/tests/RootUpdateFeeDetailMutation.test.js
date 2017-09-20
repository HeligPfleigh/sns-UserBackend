import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel, BuildingsModel, ApartmentsModel, FeeModel, BuildingMembersModel } from '../models';
import { ADMIN, ACCEPTED, MEMBER, PAID, UNPAID } from '../../constants';
import { buildingData as bd } from './data';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userId = '58f9c2502d4581000484b19a';
const userIdB = '58f9c1bf2d4581000474b198';
const buildingId = '58da279f0ff5af8c8be59c23';
const apartmentIdA = '58f9c1bf2d4581000484b189';
const apartmentIdB = '58f9c1bf2d4581000484b436';
const feeIdA = '599d08dfe7d10d34a04d528b';
const feeIdB = '599d08dfe7d10d34a04d231c';

const buildingData = Object.assign({}, bd, {
  _id: buildingId,
});

const userData = {
  _id: userId,
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

const feeData = {
  _id: feeIdA,
  type: {
    code: 2,
    name: 'Phí Nước',
  },
  from: '2017-08-01T04:47:27.872Z',
  to: '2017-09-01T04:47:27.872Z',
  apartment: apartmentIdA,
  building: buildingId,
  total: 2121345,
  status: PAID,
  description: 'no description',
  month: 8,
  year: 2017,
  __v: 0,
};

describe('RootUpdateFeeDetailMutation', () => {
  beforeEach(async () => {
    // setup db
    const building = new BuildingsModel(buildingData);
    await building.save();

    const user = new UsersModel(userData);
    await user.save();
    const userB = new UsersModel(userDataB);
    await userB.save();

    await BuildingMembersModel.create({
      building: buildingId,
      user: userId,
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
      status: ACCEPTED,
      requestInformation: {
        apartments: [apartmentIdB],
      },
    });

    const fee = new FeeModel(feeData);
    await fee.save();
  });
  test('should update fee detail', async () => {
    const input = {
      input: `${'{' +
        'feeId: "'}${feeIdA}",` +
        'total: 300000,' +
        'status: "UNPAID",' +
        `buildingId: "${buildingId}",` +
      '},',
    };
    // language=GraphQL
    const query = `
      mutation M {
        updateFeeDetail(input: ${input.input}) {
          fee {
            _id
            total
            status
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
    expect(result.data.updateFeeDetail.fee).toEqual(Object.assign({}, {
      _id: feeIdA,
      total: 300000,
      status: UNPAID,
    }));
    // await new Promise((resolve) => {
    //   setTimeout(resolve, 5000);
    // });
  });

  test('should throw error if not found the fee', async () => {
    const input = {
      input: `${'{' +
        'feeId: "'}${feeIdB}",` +
        'total: 300000,' +
        'status: "UNPAID",' +
        `buildingId: "${buildingId}",` +
      '},',
    };
    // language=GraphQL
    const query = `
      mutation M {
        updateFeeDetail(input: ${input.input}) {
          fee {
            _id
            total
            status
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
    expect(result.errors[0].message).toEqual('not found the fee');
    // await new Promise((resolve) => {
    //   setTimeout(resolve, 5000);
    // });
  });

  test('should throw error if you are not an admin', async () => {
    const input = {
      input: `${'{' +
        'feeId: "'}${feeIdA}",` +
        'total: 300000,' +
        'status: "UNPAID",' +
        `buildingId: "${buildingId}",` +
      '},',
    };
    // language=GraphQL
    const query = `
      mutation M {
        updateFeeDetail(input: ${input.input}) {
          fee {
            _id
            total
            status
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
    expect(result.errors[0].message).toEqual('you don\'t have permission to update fee detail');
    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
  });

  afterEach(async () => {
    // clear data
    await ApartmentsModel.remove({});
    await BuildingsModel.remove({});
    await UsersModel.remove({});
    await FeeModel.remove({});
    await BuildingMembersModel.remove({});
  });
});
