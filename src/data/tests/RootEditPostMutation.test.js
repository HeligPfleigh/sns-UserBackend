import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import { PostsModel } from '../models';
import schema from '../schema';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const postId = '58f9d6b62d4581000484b1a3';
const userId = '58f9c2502d4581023484b18a';
const oldMessage = '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'Viet nam tuoi dep\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}';
const newMessage = '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'Reactjs VN\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}';

const postData = {
  _id: postId,
  message: oldMessage,
  user: userId,
  author: userId,
  likes: [userId],
  photos: [],
  type: 'STATUS',
  __v: 0,
};

describe('RootEditPostMutation', () => {
  beforeEach(async () => {
    // setup db
    const post = new PostsModel(postData);
    await post.save();
  });

  test('edit post with message is string', async () => {
    const query = `
      mutation editPost { 
        editPost(_id:"${postId}", message: "${newMessage}") {
          _id
          message
        }
      }
    `;
    const rootValue = {
      request: {
        postData: {
          id: postId,
        },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    console.log(JSON.stringify(result));
    expect(result.data.editPost).toEqual(Object.assign({}, {
      _id: postId,
      message: newMessage,
    }));
  });

  afterEach(async () => {
    // clear data
    await PostsModel.remove({
      _id: postData._id,
    });
  });
});
