import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import { PostsModel, UsersModel, FriendsRelationModel } from '../models';
import schema from '../schema';
import { PUBLIC, ONLY_ME } from '../../constants';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userIdA = '58f9c2502d4581000484b18a';
const userIdB = '58f9c1bf2d4581000484b188';
const userIdC = '58f9ca042d4581000484b197';
const buildingId = '58da279f0ff5af8c8be59c36';
const userDataA = {
  _id: userIdA,
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

const userDataB = {
  _id: userIdB,
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

const userDataC = {
  _id : userIdC,
  emails: {
    address: 'thanhtt@gmail.com',
    verified: true,
  },
  username: 'thanhtt',
  profile: {
    picture: 'https://graph.facebook.com/10155107388459788/picture?type=large',
    firstName: 'Thanh',
    lastName: 'Tran Trung',
    gender: 'male',
  },
  building: buildingId,
  services: {
    facebook: {
      accessToken: 'EAAJpgxDr0K0BAKl9n9Mgelw8NMtmmLyJdKu88s0iyUBHyuJuUowITGLpPWgSLbD0tznv7XteIzx83cZBcKmzIqft3pqtWBcG4UCnQAFAnLHJOsLFm71CWVZAcoWEj1sq3AnZCZBdGMTgK6QJhm53pOOurGXPOB4ZD',
      tokenExpire: '2017-06-10T08:59:48.074Z',
    },
  },
  chatId: 'i3yXrXoLUCNthP7BaBr5dnU3fjt2',
  roles: [
    'user',
  ],
  __v: 0,
};

const friendsRelationData = {
  _id: '58f9c3ac2d4581000484b193',
  user: userIdA,
  friend: userIdC,
  isSubscribe: true,
  status: 'ACCEPTED',
  __v: 0,
};

const postData = {
  message: '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'Viet nam tuoi dep\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}',
  user: userIdA,
  author: userIdA,
  likes: ['58f9d2132d4581000484b1a0'],
  photos: [],
  type: 'STATUS',
  __v: 0,
};

describe('RootFeedQuery', () => {
  beforeEach(async () => {
    // setup db
    // try {
    const userA = new UsersModel(userDataA);
    await userA.save();
    const userB = new UsersModel(userDataB);
    await userB.save();
    const userC = new UsersModel(userDataC);
    await userC.save();
    const friendsRelation = new FriendsRelationModel(friendsRelationData);
    await friendsRelation.save();
    let post = null;
    for (let i = 20; i > 0; i--) {
      postData.message = `message${i}`;
      if (i <= 10) {
        // post on userA's wall by user A
        postData.user = userIdA;
        postData.author = userIdA;
        if (i === 10) {
          postData.privacy = ONLY_ME;
        } else {
          postData.privacy = PUBLIC;
        }
      } else if (i <= 15 && i > 10) {
        // post on userB's wall by user B
        postData.user = userIdB;
        postData.author = userIdB;
        if (i === 14) {
          postData.privacy = PUBLIC;
          postData.building = buildingId;
        } else {
          delete postData.building;
          postData.building = undefined;
        }
      } else if (i === 16) {
        // post on userC's wall by user A
        postData.user = userIdC;
        postData.author = userIdA;
      } else if (i <= 20 && i > 16) {
        // post on userC's wall by user C
        postData.user = userIdC;
        postData.author = userIdC;
        if (i === 20) {
          postData.privacy = ONLY_ME;
        } else {
          postData.privacy = PUBLIC;
        }
      }
      post = new PostsModel(postData);
      await post.save();
    }
    // } catch (e) {
    //   console.log(e.message);
    // }
  });
  test('should get post by id', async () => {
    let query = `
      {
        feeds (limit: 8) {
          edges {
            _id
            message
          }
          pageInfo {
            total
            limit
            endCursor
            hasNextPage
          }
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
    let result = await graphql(schema, query, rootValue, context);
    let messages = result.data.feeds.edges.map(m => m.message);
    expect(result.data.feeds.pageInfo.total).toEqual(15);
    expect(result.data.feeds.pageInfo.limit).toEqual(8);
    expect(result.data.feeds.pageInfo.hasNextPage).toEqual(true);
    expect(result.data.feeds.edges.length).toEqual(8);
    expect(messages).toEqual([
      'message1',
      'message2',
      'message3',
      'message4',
      'message5',
      'message6',
      'message7',
      'message8',
    ]);

    query = `
      {
        feeds (cursor: "${result.data.feeds.pageInfo.endCursor}", limit: 7) {
          edges {
            _id
            message
          }
          pageInfo {
            total
            limit
            endCursor
            hasNextPage
          }
        }
      }
    `;
    result = await graphql(schema, query, rootValue, context);
    messages = result.data.feeds.edges.map(m => m.message);
    expect(messages).toEqual([
      'message9',
      'message10',
      'message14',
      'message16',
      'message17',
      'message18',
      'message19',
    ]);
  });

  afterEach(async () => {
    // clear data
    await PostsModel.remove({});
    await UsersModel.remove({});
    await FriendsRelationModel.remove({});
  });
});
