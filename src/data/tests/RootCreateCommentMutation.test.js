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
const messageId = '58f9dad44beb380004340bbe';
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

    // } catch (e) {
    //   console.log(e.message);
    // }
  });
  test('should create comment request', async () => {
    // language=GraphQL
    const query = `
      {
        createNewComment (_id:"${postId}") {
          _id
          message
         
        }
      }
    `;

    const rootValue = {};
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.comment._id.toString()).toBe(messageId);
    expect(result.data.comment.message).toBe('messageData');
    expect(result.data.comment.user).toEqual(Object.assign({}, {
      _id: userData._id,
      username: userData.username,
    }));
    expect(result.data.comment.totalReply).toBe(5);
    const messages = result.data.comment.reply.map(m => m.message);
    expect(messages).toEqual([
      'messageData5', 'messageData4', 'messageData3', 'messageData2', 'messageData1',
    ]);
  });

  afterEach(async () => {
    // clear data
    await UsersModel.remove({});
    await PostsModel.remove({});
    await CommentsModel.remove({});
  });
});
