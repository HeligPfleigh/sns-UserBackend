import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel, BuildingsModel, ApartmentsModel, FeeModel } from '../models';
import { PAID } from '../../constants';
import { buildingData as bd, apartmentData as ad } from './data';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userId = '58f9c2502d4581000484b19a';
const buildingId = '58da279f0ff5af8c8be59c23';
const apartmentId = '58f9c1bf2d4581000484b189';
const feeIdA = '599d08dfe7d10d34a04d528b';
const feeIdB = '599d08dfe7d10d34a04d231c';

const buildingData = Object.assign({}, bd, {
  _id: buildingId,
});
const apartmentData = Object.assign({}, ad, {
  _id: apartmentId,
  building: buildingId,
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

const feeData = {
  _id: feeIdA,
  type: {
    code: 2,
    name: 'Phí Nước',
  },
  from: '2017-08-01T04:47:27.872Z',
  to: '2017-09-01T04:47:27.872Z',
  apartment: apartmentId,
  building: buildingId,
  total: 2121345,
  status: PAID,
  description: 'no description',
  month: 8,
  year: 2017,
  __v: 0,
};

describe('RootFeeQuery', () => {
  beforeEach(async () => {
    // setup db
    const building = new BuildingsModel(buildingData);
    await building.save();

    const user = new UsersModel(userData);
    await user.save();

    const apartment = new ApartmentsModel(apartmentData);
    await apartment.save();

    const fee = new FeeModel(feeData);
    await fee.save();
  });
  test('should get fee by id', async () => {
    // language=GraphQL
    const query = `
      {
        fee (_id:"${feeIdA}") {
          _id
          apartment {
            _id
          }
          building {
            _id
          }
        }
      }
    `;

    const rootValue = {};
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.fee).toEqual(Object.assign({}, {
      _id: feeIdA,
      apartment: {
        _id: apartmentId,
      },
      building: {
        _id: buildingId,
      },
    }));
  });

  test('should throw error if not found the fee', async () => {
    const query = `
      {
        fee (_id:"${feeIdB}") {
          _id
          apartment {
            _id
          }
          building {
            _id
          }
        }
      }
    `;

    const rootValue = {};
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.errors[0].message).toEqual('not found the fee');
  });

  afterEach(async () => {
    // clear data
    await ApartmentsModel.remove({
      _id: apartmentData._id,
    });
    await BuildingsModel.remove({
      _id: buildingData._id,
    });
    await UsersModel.remove({
      _id: userData._id,
    });
    await FeeModel.remove({
      _id: feeData._id,
    });
  });
});
