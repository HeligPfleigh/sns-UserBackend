import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel } from '../models';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userId = '58f9c2502d4581000484b20a';
const buildingId = '58da279f0ff5af8c8be60c23';

const userData = {
  _id: userId,
  emails: {
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

describe('RootUserQuery', () => {
  beforeEach(async () => {
    // setup db
    const user = new UsersModel(userData);
    await user.save();
  });

  test('should get user by id', async () => {
    // language=GraphQL
    const query = `
      {
        user (_id:"${userId}") {
          _id
        }
      }
    `;

    const rootValue = {};
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.user).toEqual(Object.assign({}, {
      _id: userData._id,
    }));
  });

  afterEach(async () => {
    // clear data
    await UsersModel.remove({
      _id: userData._id,
    });
  });
});
