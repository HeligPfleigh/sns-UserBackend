import mongoose from 'mongoose';
import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { BuildingsModel, BuildingMembersModel, AnnouncementsModel } from '../models';
import { ADMIN, ACCEPTED, PUBLIC } from '../../constants';
import { buildingData as bd } from './data';

const { Types: { ObjectId } } = mongoose;
// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const buildingId = '58da279f0ff5af8c8be59c37';
const userId = '58f9c2502d4581000484b18a';
const announcementIdB = '58da279f0ff5af8c8be59f12';

const buildingData = Object.assign({}, bd, {
  _id: buildingId,
});

const announcementData = {
  _id: new ObjectId(),
  message: 'thong bao 940',
  description: 'test',
  date: new Date(),
  building: buildingId,
  apartments: [],
  privacy: PUBLIC,
  isDeleted: false,
};

describe('RootDeleteAnnouncementMutation', () => {
  beforeEach(async () => {
    const building = new BuildingsModel(buildingData);
    await building.save();
    const announcement = new AnnouncementsModel(announcementData);
    await announcement.save();
  });

  test('throw error if not found announcement', async () => {
    // language=GraphQL
    const query = `
      mutation M1 {
        deleteAnnouncement(_id: "${announcementIdB}") {
          _id
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
    expect(result.errors[0].message).toEqual('Not found the announcement');
    // await new Promise(resolve => setTimeout(resolve, 5000));
  });

  test('throw error if you are not admin', async () => {
    const announcementDoc = await AnnouncementsModel.findOne();
    // language=GraphQL
    const query = `
      mutation deleteAnnouncement {
        deleteAnnouncement(_id: "${announcementDoc._id}") {
          _id
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
    expect(result.errors[0].message).toEqual('you don\'t have permission to delete announcement.');
    // await new Promise(resolve => setTimeout(resolve, 5000));
  });

  test('should create update announcement if you are admin', async () => {
    await BuildingMembersModel.create({
      building: buildingId,
      user: userId,
      type: ADMIN,
      status: ACCEPTED,
    });
    const announcementDoc = await AnnouncementsModel.findOne();
    // language=GraphQL
    const query = `
      mutation M2 {
        deleteAnnouncement(_id: "${announcementDoc._id}") {
          _id
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
    expect(result.data.deleteAnnouncement).toEqual(Object.assign({}, {
      _id: announcementDoc._id.toJSON(),
    }));
    // await new Promise(resolve => setTimeout(resolve, 5000));
    await BuildingMembersModel.remove({});
  });

  afterEach(async () => {
    // clear data
    await BuildingsModel.remove({});
    await AnnouncementsModel.remove({});
  });
});
