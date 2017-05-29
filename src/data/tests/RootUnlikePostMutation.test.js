import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel, PostsModel } from '../models';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
const userIdA = '58f9c2502d4581000474b19a';
const postId = '590310aec900da00047629a8';
const buildingId = '58da279f0ff5af8c8be59c36';
const postData = {

  _id: postId,
  createdAt: '2017-04-28T09:51:42.263Z',
  updatedAt: '2017-04-28T09:51:42.263Z',
  message: '{"entityMap":{},"blocks":[{"key":"ckaun","text":"dsadsadsa","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]}',
  user: '58f9c3d52d4581000484b194',
  author: '58f9c3d52d4581000484b194',
  likes: [],
  photos: [],
  type: 'STATUS',
  __v: 0,

};
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
describe('RootUnLikePostMutation', () => {
  beforeEach(async () => {
    // setup db
    const postModel = new PostsModel(postData);
    postModel.likes.push(userIdA);
    await postModel.save();
    const userA = new UsersModel(userDataA);
    await userA.save();
  });

  test('should unlike Post request', async () => {
    const query = `
      mutation M { 
        unlikePost(_id:"${postId}") {
          _id
          totalLikes
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
    expect(result.data.unlikePost).toEqual(Object.assign({}, {
      _id: postId,
      totalLikes: 0,
    }));
  });

  test('should check userId undefined', async () => {
    const query = `
      mutation M {
        unlikePost(_id:"${postId}") {
          _id
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
    expect(result.data.unlikePost).toEqual(null);
    expect(result.errors[0].message).toEqual('userId is undefined');
  });
  test('should check postId undefind', async () => {
    const query = `
      mutation M {
        unlikePost {
          _id
        }
      }
    `;
    const rootValue = {
      request: {
        user: { userIdA },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data).toEqual(undefined);
    expect(result.errors[0].message).toEqual('Field "unlikePost" argument "_id" of type "String!" is required but not provided.');
  });
  test('should check userId not exist', async () => {
    const query = `
      mutation M {
        unlikePost(_id:"${postId}") {
          _id
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
    expect(result.data.unlikePost).toEqual(null);
    expect(result.errors[0].message).toEqual('userId does not exist');
  });
  test('should check postId not exist', async () => {
    const fakeId = '58f9ca042d4581000474b109';
    const query = `
      mutation M {
        unlikePost(_id:"${fakeId}") {
          _id
        }
      }
    `;
    const rootValue = {
      request: {
        user: { id: userIdA },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.unlikePost).toEqual(null);
    expect(result.errors[0].message).toEqual('postId does not exist');
  });

  afterEach(async () => {
    // clear data
    await PostsModel.remove({
      _id: { $in: [postId] },
    });
    await UsersModel.remove({});
  });
});
