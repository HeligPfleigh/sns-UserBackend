import {
  setupTest,
} from '../../../../test/helper';

import Service from '../service';
import { UsersModel } from '../../models';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

// const userId = '58f9c2502d4581000484b20a';
const buildingId = '58da279f0ff5af8c8be60c23';

const userData = {
  // _id: userId,
  // createdAt: '2017-04-21T08:26:56.403Z',
  // updatedAt: '2017-04-21T08:26:56.403Z',
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

describe('server', () => {
  beforeAll(async () => {
    // setup db
    for (let i = 10; i > 0; i--) {
      userData.username = `username${i}`;
      await UsersModel.create(userData);
    }
  });

  /**
      {
        'data': [
          ... Endpoint data is here
        ],
        'paging': {
          'total': 10,
          'limit': 2,
          'skip': 0,
        }
      }
   */

  test('paging by skip', async () => {
    const u = Service({
      Model: UsersModel,
      paginate: {
        default: 2,
        max: 4,
      },
    });
    let result = await u.find({});
    let list = result.data.map(t => t.username);
    expect(result.paging.total).toEqual(10);
    expect(result.paging.limit).toEqual(2);
    expect(result.paging.skip).toEqual(0);
    expect(list).toEqual(['username10', 'username9']);
    result = await u.find({
      query: {
        $skip: '2',
      },
    });
    list = result.data.map(t => t.username);
    expect(list).toEqual(['username8', 'username7']);

    result = await u.find({
      query: {
        $skip: '4',
      },
    });
    list = result.data.map(t => t.username);
    expect(list).toEqual(['username6', 'username5']);
  });

  test('paging with no default options (no paging)', async () => {
    const u = Service({
      Model: UsersModel,
      paginate: {
        max: 4,
      },
    });
    const result = await u.find({
      query: {
        $limit: 2,
      },
    });
    const list = result.map(t => t.username);
    expect(list).toEqual(['username10', 'username9']);
  });

  test('paging by skip with other field', async () => {
    const u = Service({
      Model: UsersModel,
      paginate: {
        default: 2,
        max: 4,
      },
    });
    let result = await u.find({
      query: {
        $select: {
          username: 1,
        },
        'email.address': 'muakhoc90@gmail.com',
      },
    });
    let list = result.data.map(t => t.username);
    expect(result.paging.total).toEqual(10);
    expect(result.paging.limit).toEqual(2);
    expect(result.paging.skip).toEqual(0);
    expect(list).toEqual(['username10', 'username9']);

    result = await u.find({
      query: {
        $skip: '2',
      },
    });
    list = result.data.map(t => t.username);
    expect(list).toEqual(['username8', 'username7']);
  });

  /**
     {
        'data': [
          ... Endpoint data is here
        ],
        'paging': {
          endCursor,
          hasNextPage: hasNextPageFlag,
        }
      }
   */

  test('paging by cursor by _id', async () => {
    const u = Service({
      Model: UsersModel,
      paginate: {
        default: 2,
        max: 4,
      },
      cursor: true,
    });
    let result = await u.find({
      query: {
        $sort: {
          createdAt: -1,
        },
      },
    });
    let list = result.data.map(t => t.username);
    expect(result.paging.total).toEqual(10);
    expect(result.paging.limit).toEqual(2);
    expect(result.paging.hasNextPage).toEqual(true);
    expect(list).toEqual(['username1', 'username2']);
    result = await u.find({
      $cursor: result.paging.endCursor,
      query: {
        $sort: {
          createdAt: -1,
        },
      },
    });
    list = result.data.map(t => t.username);
    expect(result.paging.total).toEqual(10);
    expect(result.paging.limit).toEqual(2);
    expect(result.paging.hasNextPage).toEqual(true);
    expect(list).toEqual(['username3', 'username4']);
  });

  afterAll(async () => {
    // clear data
    await UsersModel.remove({});
  });
});
