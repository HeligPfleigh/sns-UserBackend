import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel, BuildingsModel, ApartmentsModel } from '../models';
import { buildingData as bd, apartmentData as ad } from './data';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const buildingId = '58da279f0ff5af8c8be59c23';
const userId = '58f9c2502d4581000484b19a';
const apartmentId = '58f9c1bf2d4581000484b189';
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
const apartmentData = Object.assign({}, ad, {
  _id: apartmentId,
  building: buildingId,
});

describe('RootApartmentQuery', () => {
  beforeEach(async () => {
    // setup db
    const building = new BuildingsModel(buildingData);
    await building.save();

    const user = new UsersModel(userData);
    await user.save();

    const apartment = new ApartmentsModel(apartmentData);
    await apartment.save();
  });
  test('should get apartment by id', async () => {
    // language=GraphQL
    const query = `
      {
        apartment (_id:"${apartmentId}") {
          _id
          building {
            _id
          }
        }
      }
    `;

    const rootValue = {};
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.apartment).toEqual(Object.assign({}, {
      _id: apartmentData._id,
      building: {
        _id: buildingData._id,
      },
    }));
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
  });
});
