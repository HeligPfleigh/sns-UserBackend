import mongoose from 'mongoose';
import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { BuildingsModel, BuildingMembersModel } from '../models';
import { ADMIN, ACCEPTED } from '../../constants';
import { buildingData as bd } from './data';

const { Types: { ObjectId } } = mongoose;
// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const buildingId = ObjectId('58da279f0ff5af8c8be59c37');
const userId = ObjectId('58f9c2502d4581000484b18a');
const buildingData = Object.assign({}, bd, {
  _id: buildingId,
  announcements: [{
    _id: ObjectId('23da279f0ff5af8c8be59c46'),
    date: new Date('2017-06-01T11:02:26.266Z'),
    message: 'Thông báo 1',
    type: 'TYPE1',
  }],
});

describe('RootDeleteBuildingAnnouncementMutation', () => {
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
      '},',
    };
    // language=GraphQL
    const query = `
      mutation deleteBuildingAnnouncement {
        deleteBuildingAnnouncement(input: ${input.input}) {
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
      '},',
    };
    // language=GraphQL
    const query = `
      mutation deleteBuildingAnnouncement {
        deleteBuildingAnnouncement(input: ${input.input}) {
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
    expect(result.data.deleteBuildingAnnouncement.announcement).toEqual(Object.assign({}, {
      message: 'Thông báo 1',
      type: 'TYPE1',
    }));
    const b = await BuildingsModel.findOne();
    expect(b.announcements.length, 0);
    // await new Promise(resolve => setTimeout(resolve, 5000));
    await BuildingMembersModel.remove({});
  });

  afterEach(async () => {
    // clear data
    await BuildingsModel.remove({
      _id: buildingId,
    });
  });
});
