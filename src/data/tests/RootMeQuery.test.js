import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import { PostsModel, UsersModel, FriendsRelationModel } from '../models';
import schema from '../schema';

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

describe('RootMeQuery', () => {
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
      } else if (i <= 15 && i > 10) {
        // post on userB's wall by user B
        postData.user = userIdB;
        postData.author = userIdB;
      } else if (i === 16) {
        // post on userC's wall by user A
        postData.user = userIdC;
        postData.author = userIdA;
      } else if (i <= 20 && i > 16) {
        // post on userC's wall by user C
        postData.user = userIdC;
        postData.author = userIdC;
      }
      post = new PostsModel(postData);
      await post.save();
    }
    // } catch (e) {
    //   console.log(e.message);
    // }
  });
  test('should get user profile', async () => {
    let query = `
      {
        me {
          _id
          username
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
    expect(result.data.me).toEqual(Object.assign({}, {
      _id: userDataA._id,
      username: userDataA.username,
    }));

    query = `
      {
        me {
          posts {
            _id
            message
          }
        }
      }
    `;
    result = await graphql(schema, query, rootValue, context);
    const messages = result.data.me.posts.map(m => m.message);
    expect(messages).toEqual([
      'message1',
      'message2',
      'message3',
      'message4',
      'message5',
      'message6',
      'message7',
      'message8',
      'message9',
      'message10',
    ]);

    query = `
      {
        me {
          friends {
            _id
            username
          }
        }
      }
    `;
    result = await graphql(schema, query, rootValue, context);
    const friends = result.data.me.friends.map(m => m.username);
    expect(friends).toEqual(['thanhtt']);

    query = `
      {
        me {
          totalFriends
          totalNotification
        }
      }
    `;
    result = await graphql(schema, query, rootValue, context);
    expect(result.data.me.totalFriends).toEqual(1);
    expect(result.data.me.totalNotification).toEqual(0);

    console.warn('missing test case me.friends');
    console.warn('missing test case me.friendRequests');
    console.warn('missing test case me.friendSuggestions');

    // console.log(JSON.stringify(result));
  });

  afterEach(async () => {
    // clear data
    await PostsModel.remove({});
    await UsersModel.remove({});
    await FriendsRelationModel.remove({});
  });
});
