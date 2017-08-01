import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { BuildingsModel, BuildingMembersModel } from '../models';
import { ADMIN, ACCEPTED } from '../../constants';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const buildingId = '58da279f0ff5af8c8be59c37';
const userId = '58f9c2502d4581000484b18a';
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

describe('RootCreateNewBuildingAnnouncementMutation', () => {
  beforeEach(async () => {
    // setup db
    const building = new BuildingsModel(buildingData);
    await building.save();
  });

  test('throw error if you are not admin', async () => {
    const input = {
      input: '{' +
        'buildingId: "' + buildingId + '",' +
        'announcementInput: {' +
          'type: TYPE1,' +
          'message: "Message",' +
        '},' +
      '},',
    };
    // language=GraphQL
    const query = `
      mutation createNewBuildingAnnouncement {
        createNewBuildingAnnouncement(input: ${input.input}) {
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
        'announcementInput: {' +
          'type: TYPE1,' +
          'message: "Message",' +
        '},' +
      '},',
    };
    // language=GraphQL
    const query = `
      mutation createNewBuildingAnnouncement {
        createNewBuildingAnnouncement(input: ${input.input}) {
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
    // console.log(await BuildingsModel.findOne());
    // await new Promise(resolve => setTimeout(resolve, 5000));
    expect(result.data.createNewBuildingAnnouncement.announcement).toEqual(Object.assign({}, {
      message: 'Message',
      type: 'TYPE1',
    }));
    await BuildingMembersModel.remove({});
  });

  afterEach(async () => {
    // clear data
    await BuildingsModel.remove({
      _id: buildingData._id,
    });
  });
});
