import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { BuildingsModel } from '../models';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const buildingId = '58da279f0ff5af8c8be59c37';
const buildingData = {
  _id: buildingId,
  name: 'Vinhomes Riverside',
  address: {
    country: 'vn',
    city: 'Ha Noi',
    state: 'Long Bien',
    street: 'No.7, Bang Lang 1 Street',
  },
  location: {
    coordinates: [105.7976544, 21.0714764],
    type: 'Point',
  },
  description: 'Vingroup Joint Stock Company',
  __v: 0,
};

describe('RootBuildingQuery', () => {
  beforeEach(async () => {
    // setup db
    const building = new BuildingsModel(buildingData);
    await building.save();
  });

  test('should get building by id', async () => {
    // language=GraphQL
    const query = `
      {
        building (_id:"${buildingId}") {
          _id
        }
      }
    `;

    const rootValue = {};
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.building).toEqual(Object.assign({}, {
      _id: buildingData._id,
    }));
  });

  afterEach(async () => {
    // clear data
    await BuildingsModel.remove({
      _id: buildingData._id,
    });
  });
});
