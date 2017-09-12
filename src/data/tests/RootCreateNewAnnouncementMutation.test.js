import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { BuildingsModel, BuildingMembersModel } from '../models';
import { ADMIN, ACCEPTED, PUBLIC } from '../../constants';
import { buildingData as bd } from './data';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const buildingId = '58da279f0ff5af8c8be59c37';
const userId = '58f9c2502d4581000484b18a';
const buildingData = Object.assign({}, bd, {
  _id: buildingId,
});

describe('RootCreateNewAnnouncementMutation', () => {
  beforeEach(async () => {
    // setup db
    const building = new BuildingsModel(buildingData);
    await building.save();
  });

  test('throw error if you are not admin', async () => {
    const input = {
      input: '{' +
        'buildingId: "' + buildingId + '",' +
        'message: "Message",' +
        'description: "Description",' +
        'privacy: PUBLIC,' +
        'apartments: [],' +
      '},',
    };
    // language=GraphQL
    const query = `
      mutation createNewAnnouncement {
        createNewAnnouncement(input: ${input.input}) {
          message
          description
          privacy
          building {
            _id
          }
          apartments {
            _id
            name
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
    expect(result.errors[0].message).toEqual('you dont have permission to create new announcement');
    // await new Promise(resolve => setTimeout(resolve, 5000));
  });

  test('should create new announcement if you are admin', async () => {
    await BuildingMembersModel.create({
      building: buildingId,
      user: userId,
      type: ADMIN,
      status: ACCEPTED,
    });
    const input = {
      input: '{' +
        'buildingId: "' + buildingId + '",' +
        'message: "Message",' +
        'description: "Description",' +
        'privacy: PUBLIC,' +
        'apartments: [],' +
      '},',
    };
    // language=GraphQL
    const query = `
      mutation createNewAnnouncement {
        createNewAnnouncement(input: ${input.input}) {
          message
          description
          privacy
          building {
            _id
          }
          apartments {
            _id
            name
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
    expect(result.data.createNewAnnouncement).toEqual(Object.assign({}, {
      message: 'Message',
      description: 'Description',
      privacy: PUBLIC,
      building: {
        _id: buildingId,
      },
      apartments: [],
    }));
    // await new Promise(resolve => setTimeout(resolve, 5000));
    await BuildingMembersModel.remove({});
  });

  afterEach(async () => {
    // clear data
    await BuildingsModel.remove({
      _id: buildingData._id,
    });
  });
});
