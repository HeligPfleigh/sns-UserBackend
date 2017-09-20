import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { PostsModel, UsersModel, FriendsRelationModel } from '../models';
import { PUBLIC, FRIEND, ONLY_ME } from '../../constants';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userIdA = '58f9c2502d4581000484b18a';
const userIdB = '58f9c1bf2d4581000484b188';
const userIdC = '58f9ca042d4581000484b197';
const userIdD = '58f9ca042d4581000484c765';

const buildingId = '58da279f0ff5af8c8be59c36';

const postIdA = '58f9d6b62d4581000484b1a3';
const postIdB = '58f9d6b62d4581111484b1a3';
const postIdC = '58f9d6b62d4581222484b1a3';
const postIdD = '58f9d6b62d4581333484b1a3';
const postIdE = '58f9d6b62d4581546484b1a3';
const postIdF = '58f9d6b62d4581789484b1a3';
const postIdG = '58f9d6b62d4581789456b1a3';
const postIdH = '58f9d6b62d4581789834b1a3';

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

const userDataB = {
  _id: userIdB,
  email: {
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
  _id: userIdC,
  email: {
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
  user: userIdB,
  friend: userIdA,
  isSubscribe: true,
  status: 'ACCEPTED',
  __v: 0,
};

const postDataA = {
  _id: postIdA,
  message: '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'Viet nam tuoi dep\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}',
  user: userIdA,
  author: userIdA,
  likes: [],
  photos: [],
  privacy: PUBLIC,
  type: 'STATUS',
  __v: 0,
};

const postDataB = {
  _id: postIdB,
  message: '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'Viet nam tuoi dep\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}',
  user: userIdA,
  author: userIdA,
  likes: [],
  photos: [],
  privacy: FRIEND,
  type: 'STATUS',
  __v: 0,
};

const postDataC = {
  _id: postIdC,
  message: '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'Viet nam tuoi dep\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}',
  user: userIdA,
  author: userIdA,
  likes: [],
  photos: [],
  privacy: ONLY_ME,
  type: 'STATUS',
  __v: 0,
};

const postDataD = {
  _id: postIdD,
  message: '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'Viet nam tuoi dep\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}',
  user: userIdB,
  author: userIdB,
  likes: [],
  photos: [],
  privacy: PUBLIC,
  type: 'STATUS',
  __v: 0,
};

const postDataE = {
  _id: postIdE,
  message: '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'Viet nam tuoi dep\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}',
  user: userIdB,
  author: userIdB,
  likes: [],
  photos: [],
  privacy: FRIEND,
  type: 'STATUS',
  __v: 0,
};

const postDataF = {
  _id: postIdF,
  message: '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'Viet nam tuoi dep\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}',
  user: userIdB,
  author: userIdB,
  likes: [],
  photos: [],
  privacy: ONLY_ME,
  type: 'STATUS',
  __v: 0,
};

const postDataG = {
  _id: postIdG,
  message: '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'Viet nam tuoi dep\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}',
  user: userIdC,
  author: userIdC,
  likes: [],
  photos: [],
  privacy: PUBLIC,
  type: 'STATUS',
  __v: 0,
};

const postDataH = {
  _id: postIdH,
  message: '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'Viet nam tuoi dep\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}',
  user: userIdC,
  author: userIdC,
  likes: [],
  photos: [],
  privacy: FRIEND,
  type: 'STATUS',
  __v: 0,
};

describe('RootPostQuery', () => {
  beforeEach(async () => {
    // setup db
    const userA = new UsersModel(userDataA);
    await userA.save();
    const userB = new UsersModel(userDataB);
    await userB.save();
    const userC = new UsersModel(userDataC);
    await userC.save();

    const postA = new PostsModel(postDataA);
    await postA.save();
    const postB = new PostsModel(postDataB);
    await postB.save();
    const postC = new PostsModel(postDataC);
    await postC.save();
    const postD = new PostsModel(postDataD);
    await postD.save();
    const postE = new PostsModel(postDataE);
    await postE.save();
    const postF = new PostsModel(postDataF);
    await postF.save();
    const postG = new PostsModel(postDataG);
    await postG.save();
    const postH = new PostsModel(postDataH);
    await postH.save();

    const friendsRelation = new FriendsRelationModel(friendsRelationData);
    await friendsRelation.save();
  });
  test('should throw error if user not found', async () => {
    // language=GraphQL
    const query = `
      {
        resident(_id:"${userIdD}") {
          _id
          posts (cursor:"null") {
            pageInfo {
              endCursor
              hasNextPage
              total
              limit
            }
            edges {
              _id
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    // console.log(JSON.stringify(result.errors[0].message));
    // await new Promise((resolve) => { setTimeout(resolve, 5000); });
    expect(result.errors[0].message).toEqual('not found user request');
  });

  test('should get posts of me', async () => {
    // language=GraphQL
    const query = `
      {
        resident(_id:"${userIdA}") {
          _id
          posts {
            pageInfo {
              endCursor
              hasNextPage
              total
              limit
            }
            edges {
              _id
              privacy
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = getContext({
      user: {
        id: userIdA,
      },
    });
    const result = await graphql(schema, query, rootValue, context);
    // console.log(JSON.stringify(result.data.resident));
    // await new Promise((resolve) => { setTimeout(resolve, 5000); });
    expect(result.data.resident).toEqual(Object.assign({}, {
      _id: userIdA,
      posts: {
        pageInfo: {
          endCursor: postIdA,
          hasNextPage: false,
          total: 3,
          limit: 5,
        },
        edges: [
          {
            _id: postIdC,
            privacy: ONLY_ME,
          },
          {
            _id: postIdB,
            privacy: FRIEND,
          },
          {
            _id: postIdA,
            privacy: PUBLIC,
          },
        ],
      },
    }));
  });

  test('should get posts of friends', async () => {
    // language=GraphQL
    const query = `
      {
        resident(_id:"${userIdB}") {
          _id
          posts {
            pageInfo {
              endCursor
              hasNextPage
              total
              limit
            }
            edges {
              _id
              privacy
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = getContext({
      user: {
        id: userIdA,
      },
    });
    const result = await graphql(schema, query, rootValue, context);
    // console.log(JSON.stringify(result.data.resident));
    // await new Promise((resolve) => { setTimeout(resolve, 5000); });
    expect(result.data.resident).toEqual(Object.assign({}, {
      _id: userIdB,
      posts: {
        pageInfo: {
          endCursor: postIdD,
          hasNextPage: false,
          total: 2,
          limit: 5,
        },
        edges: [
          {
            _id: postIdE,
            privacy: FRIEND,
          },
          {
            _id: postIdD,
            privacy: PUBLIC,
          },
        ],
      },
    }));
  });

  test('should get posts of other users', async () => {
    // language=GraphQL
    const query = `
      {
        resident(_id:"${userIdC}") {
          _id
          posts {
            pageInfo {
              endCursor
              hasNextPage
              total
              limit
            }
            edges {
              _id
              privacy
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = getContext({
      user: {
        id: userIdA,
      },
    });
    const result = await graphql(schema, query, rootValue, context);
    // console.log(JSON.stringify(result.data.resident));
    // await new Promise((resolve) => { setTimeout(resolve, 5000); });
    expect(result.data.resident).toEqual(Object.assign({}, {
      _id: userIdC,
      posts: {
        pageInfo: {
          endCursor: postIdG,
          hasNextPage: false,
          total: 1,
          limit: 5,
        },
        edges: [
          {
            _id: postIdG,
            privacy: PUBLIC,
          },
        ],
      },
    }));
  });

  afterEach(async () => {
    // clear data
    await UsersModel.remove({});
    await PostsModel.remove({});
    await FriendsRelationModel.remove({});
  });
});
