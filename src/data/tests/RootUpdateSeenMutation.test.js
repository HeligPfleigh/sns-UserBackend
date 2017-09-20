import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel, NotificationsModel } from '../models';
import {
  RESOURCE_UPDATED_SUCCESSFULLY,
} from '../../constants';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
const userIdA = '58f9c2502d4581000474b19a';
const notificationId = '590310aec900da00047629a8';
const buildingId = '58da279f0ff5af8c8be59c36';
const notificationData = {
  _id: notificationId,
  createdAt: '2017-05-17T10:14:07.301Z',
  updatedAt: '2017-05-17T12:23:08.821Z',
  user: '58f9c2502d4581000484b18a',
  subject: '591c226f14f44f132b6e57b7',
  actors: [
    '58f9d2132d4581000484b1a0',
  ],
  isRead: false,
  seen: false,
  type: 'NEW_POST',
  __v: 0,

};
const userDataA = {
  _id: userIdA,
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
describe('RootUpdateSeenMutation', () => {
  beforeEach(async () => {
    // setup db
    const notiModel = new NotificationsModel(notificationData);
    await notiModel.save();
    const userA = new UsersModel(userDataA);
    await userA.save();
  });

  test('should update Seen request', async () => {
    const query = `
      mutation M { 
        updateSeen {
          response
        }
      }
    `;
    const rootValue = {
      request: {
        user: {
          id: userIdA,
        },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.updateSeen).toEqual(Object.assign({}, {
      response: RESOURCE_UPDATED_SUCCESSFULLY,
    }));
  });

  test('should check userId undefined', async () => {
    const query = `
      mutation M {
        updateSeen {
          response
        }
      }
    `;
    const rootValue = {
      request: {
        user: {},
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.updateSeen).toEqual(null);
    expect(result.errors[0].message).toEqual('userId is undefined');
  });

  test('should check userId not exist', async () => {
    const query = `
      mutation M {
        updateSeen {
          response
        }
      }
    `;
    const rootValue = {
      request: {
        user: { id: '58f9ca042d4581000474b109' },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.updateSeen).toEqual(null);
    expect(result.errors[0].message).toEqual('userId does not exist');
  });

  afterEach(async () => {
    // clear data
    await NotificationsModel.remove({
      _id: { $in: [notificationId] },
    });
    await UsersModel.remove({});
  });
});
