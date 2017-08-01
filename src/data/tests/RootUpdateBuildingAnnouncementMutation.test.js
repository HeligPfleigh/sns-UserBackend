import mongoose from 'mongoose';
import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { BuildingsModel, BuildingMembersModel } from '../models';
import { ADMIN, ACCEPTED } from '../../constants';

const { Types: { ObjectId } } = mongoose;

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const buildingId = ObjectId('58da279f0ff5af8c8be59c37');
const userId = ObjectId('58f9c2502d4581000484b18a');
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
  announcements: [{
    _id: ObjectId('23da279f0ff5af8c8be59c46'),
    date: new Date('2017-06-01T11:02:26.266Z'),
    message: 'Thông báo 1',
    type: 'TYPE1',
  }],
  description: 'Vingroup Joint Stock Company',
  __v: 0,
  createdAt: new Date('2017-06-10T11:02:26.266Z'),
  updatedAt: new Date('2017-07-30T02:26:04.257Z'),
};

describe('RootUpdateBuildingAnnouncementMutation', () => {
  beforeEach(async () => {
    await BuildingsModel.remove({
      _id: buildingId,
    });
    await BuildingsModel.collection.insert(buildingData);
  });

  test('throw error if you are not admin', async () => {
    const input = {
      input: '{' +
        'buildingId: "' + buildingId + '",' +
        'announcementId: "23da279f0ff5af8c8be59c46"' +
        'announcementInput: {' +
          'type: TYPE2,' +
          'message: "Message",' +
        '},' +
      '},',
    };
    // language=GraphQL
    const query = `
      mutation updateBuildingAnnouncement {
        updateBuildingAnnouncement(input: ${input.input}) {
          announcement {
            message
            type
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
    const context = getContext({
      user: {
        id: userId,
      },
    });
    const result = await graphql(schema, query, rootValue, context);
    // await new Promise(resolve => setTimeout(resolve, 5000));
    expect(result.errors[0].message).toEqual('you dont have permission to create new announcement');
  });

  test('should create update announcement if you are admin', async () => {
    await BuildingMembersModel.create({
      building: buildingId,
      user: userId,
      type: ADMIN,
      status: ACCEPTED,
    });
    const input = {
      input: '{' +
        'buildingId: "' + buildingId + '",' +
        'announcementId: "23da279f0ff5af8c8be59c46"' +
        'announcementInput: {' +
          'type: TYPE2,' +
          'message: "Message",' +
        '},' +
      '},',
    };
    // language=GraphQL
    const query = `
      mutation updateBuildingAnnouncement {
        updateBuildingAnnouncement(input: ${input.input}) {
          announcement {
            message
            type
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
    const context = getContext({
      user: {
        id: userId,
      },
    });
    const result = await graphql(schema, query, rootValue, context);
    // await new Promise(resolve => setTimeout(resolve, 5000));
    expect(result.data.updateBuildingAnnouncement.announcement).toEqual(Object.assign({}, {
      message: 'Message',
      type: 'TYPE2',
    }));
    await BuildingMembersModel.remove({});
  });

  afterEach(async () => {
    // clear data
    await BuildingsModel.remove({
      _id: buildingId,
    });
  });
});
