import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel, PostsModel, CommentsModel } from '../models';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userId = '58f9c2502d4581000484b18a';
const postId = '58f9d6b62d4581000484b1a3';
const messageData = 'messageData';
const commentId = '58f9e69e4beb380004340bc4';
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
  building: '58da279f0ff5af8c8be59c36',
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

const postData = {
  _id: postId,
  message: 'postData',
  user: userId,
  author: userId,
  likes: [userId],
  photos: [],
  type: 'STATUS',
  __v: 0,
};


describe('RootCreateCommentMutation', () => {
  beforeEach(async () => {
    // setup db
    // try {
    const user = new UsersModel(userData);
    await user.save();
    const post = new PostsModel(postData);
    await post.save();
  });
  test('should create comment request for post', async () => {
    // language=GraphQL
    const query = `
      mutation M {
        createNewComment(_id:"${postId}",message:"${messageData}") {
          user {
            _id
          }
          message
          post {
            _id
          }
        }
      }
    `;

    const rootValue = {
      request: {
        user: { id: userId },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.createNewComment).toEqual(Object.assign({}, {
      user: { _id: userId },
      message: messageData,
      post: { _id: postId },
    }));
    const c = await CommentsModel.findOne({ user: userId, post: postId, message: messageData });
    expect(c.reply).toEqual(undefined);
  });
  test('should check userId undefind', async () => {
    const query = `
      mutation M {
        createNewComment(_id:"${postId}",message:"${messageData}") {
          user {
            _id
          }
          message
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
    expect(result.data.createNewComment).toEqual(null);
    expect(result.errors[0].message).toEqual('userId is undefined');
  });
  test('should check postId undefined', async () => {
    const query = `
      mutation M {
        createNewComment(message:"${messageData}") {
          user {
            _id
          }
          message
        }
      }
    `;
    const rootValue = {
      request: {
        user: { id: userId },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data).toEqual(undefined);
    expect(result.errors[0].message).toEqual('Field "createNewComment" argument "_id" of type "String!" is required but not provided.');
  });
  test('should check messageData undefined', async () => {
    const query = `
      mutation M {
        createNewComment(_id :"${postId}") {
          user {
            _id
          }
          message
        }
      }
    `;
    const rootValue = {
      request: {
        user: { id: userId },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data).toEqual(undefined);
    expect(result.errors[0].message).toEqual('Field "createNewComment" argument "message" of type "String!" is required but not provided.');
  });
  afterEach(async () => {
    // clear data
    await UsersModel.remove({});
    await PostsModel.remove({});
    await CommentsModel.remove({});
  });
});
