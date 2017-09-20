import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import { PostsModel, UsersModel, BuildingsModel } from '../models';
import schema from '../schema';
import { buildingData as bd } from './data';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;


const userId = '58f9c2502d4581023484b18a';
const userIdF = '58f9c2302d4581023484b18a';

const buildingIdA = '58da280f0ff5af8c8be59c37';
const buildingIdB = '58da279f0ff5af8c8be59c37';

const postId = '58f9d6b62d4581000484b1a3';

const userData = {
  _id: userId,
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
  building: buildingIdA,
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

const buildingData = Object.assign({}, bd, {
  _id: buildingIdA,
});

const postData = {
  _id: postId,
  message: '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'Viet nam tuoi dep\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}',
  user: userId,
  author: userId,
  building: buildingIdA,
  likes: [userId],
  photos: [],
  type: 'STATUS',
  __v: 0,
};

describe('RootDeletePostOnBuildingMutation', () => {
  beforeEach(async () => {
    // setup db
    const user = new UsersModel(userData);
    await user.save();
    const building = new BuildingsModel(buildingData);
    await building.save();
    const post = new PostsModel(postData);
    await post.save();
  });

  test('should get post', async () => {
    const query = `
      mutation M { 
        deletePostOnBuilding(postId:"${postId}", buildingId:"${buildingIdA}") {
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
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.deletePostOnBuilding).toEqual(Object.assign({}, {
      _id: postId,
    }));
  });

  test('should throw error if user is not author', async () => {
    const query = `
      mutation M { 
        deletePostOnBuilding(postId:"${postId}", buildingId:"${buildingIdA}") {
          _id
        }
      }
    `;
    const rootValue = {
      request: {
        user: {
          id: userIdF,
        },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.deletePostOnBuilding).toEqual(null);
    expect(result.errors[0].message).toEqual('not found the post');
  });

  test('should throw error if building does not this post', async () => {
    const query = `
      mutation M { 
        deletePostOnBuilding(postId:"${postId}", buildingId:"${buildingIdB}") {
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
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.deletePostOnBuilding).toEqual(null);
    expect(result.errors[0].message).toEqual('not found the post');
  });

  afterEach(async () => {
    // clear data
    await UsersModel.remove({
      _id: userData._id,
    });
    await BuildingsModel.remove({
      _id: buildingData._id,
    });
    await PostsModel.remove({
      _id: postData._id,
    });
  });
});
