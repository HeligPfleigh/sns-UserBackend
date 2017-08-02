import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel, BuildingsModel, PostsModel } from '../models';

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
const userId = '58f9c1bf2d4581000474b198';
const messageData = 'message Data';
const userDataA = {
  _id: userId,
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

describe('CreateNewPostOnBuildingMutation', () => {
  beforeEach(async () => {
    // setup db
    const building = new BuildingsModel(buildingData);
    await building.save();
    const user = new UsersModel(userDataA);
    await user.save();
  });

  test('should create new post on building page', async () => {
    // language=GraphQL
    const query = `
      mutation M { 
        createNewPostOnBuilding(message:"${messageData}", buildingId:"${buildingId}") {
          building {
            _id
          }
          message
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
    expect(result.data.createNewPostOnBuilding).toEqual(Object.assign({}, {
      building: {
        _id: buildingId,
      },
      message: messageData,
    }));
    console.warn('write more test');
  });

  afterEach(async () => {
    // clear data
    await BuildingsModel.remove({
      _id: buildingData._id,
    });
    await UsersModel.remove({});
    await PostsModel.remove({});
  });
});
