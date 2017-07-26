import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import { PUBLIC } from '../../constants';
import schema from '../schema';
import { UsersModel, PostsModel } from '../models';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userIdA = '58f9c1bf2d4581000474b198';
const userIdB = '58f9c1bf2d4581000484b188';
const userIdC = '58f7c1bf2d5581111484b188';
const postId = '58f9d6b62d4581000484b1a3';
const postIdB = '58f9d6b62d4581111484b1a3';
const postIdC = '58f9d6b62d4583333484b1a3';
const buildingId = '58da279f0ff5af8c8be59c36';
const userDataA = {
  _id: userIdA,
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

const postData = {
  _id: postId,
  message: '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'Viet nam tuoi dep\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}',
  user: userIdB,
  author: userIdB,
  likes: [userIdB],
  photos: [],
  type: 'STATUS',
  __v: 0,
};

const postDataB = {
  _id: postIdB,
  message: '{\'entityMap\':{},\'blocks\':[{\'key\':\'4gvpl\',\'text\':\'ReactJs Viet Nam\',\'type\':\'unstyled\',\'depth\':0,\'inlineStyleRanges\':[],\'entityRanges\':[],\'data\':{}}]}',
  user: userIdB,
  author: userIdB,
  sharing: postId,
  likes: [userIdB],
  photos: [],
  type: 'STATUS',
  __v: 0,
};

console.log('start');

describe('RootSharingPostMutation', () => {
  beforeEach(async () => {
    // setup db
    const user = new UsersModel(userDataA);
    await user.save();
    const userB = new UsersModel(userDataB);
    await userB.save();
    const post = new PostsModel(postData);
    await post.save();
    const postB = new PostsModel(postDataB);
    await postB.save();
  });

  test('should share other people\'s post', async () => {
    const query = `
      mutation M1 { 
        sharingPost(_id:"${postId}") {
          user {
            _id
          }
          sharing {
            _id
            author {
              _id
            }
          }
          
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
    expect(result.data.sharingPost).toEqual(Object.assign({}, {
      user: {
        _id: userIdA,
      },
      sharing: {
        _id: postId,
        author: {
          _id: userIdB,
        },
      },
    }));
  });

  test('should share post', async () => {
    const query = `
      mutation M2 { 
        sharingPost(_id:"${postId}") {
          user {
            _id
          }
          sharing {
            _id
            author {
              _id
            }
          }
          
        }
      }
    `;
    const rootValue = {
      request: {
        user: { id: userIdB },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.sharingPost).toEqual(Object.assign({}, {
      user: {
        _id: userIdB,
      },
      sharing: {
        _id: postId,
        author: {
          _id: userIdB,
        },
      },
    }));
  });

  test('should share my and my friend\'s shared post', async () => {
    const query = `
      mutation M2 { 
        sharingPost(_id:"${postIdB}") {
          user {
            _id
          }
          sharing {
            _id
            author {
              _id
            }
          }
          
        }
      }
    `;
    const rootValue = {
      request: {
        user: { id: userIdB },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.sharingPost).toEqual(Object.assign({}, {
      user: {
        _id: userIdB,
      },
      sharing: {
        _id: postId,
        author: {
          _id: userIdB,
        },
      },
    }));
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 5000);
    });
  });

  test('should throw error if not found the post', async () => {
    const query = `
      mutation M3 { 
        sharingPost(_id:"${postIdC}") {
          user {
            _id
          }
          sharing {
            _id
            author {
              _id
            }
          }
          
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
    expect(result.data.sharingPost).toEqual(null);
    expect(result.errors[0].message).toEqual('Not found the post');
    // await new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve();
    //   }, 5000);
    // });
  });

  test('should throw error if author is undefined', async () => {
    const query = `
      mutation M3 { 
        sharingPost(_id:"${postId}") {
          user {
            _id
          }
          sharing {
            _id
            author {
              _id
            }
          }
          
        }
      }
    `;
    const rootValue = {
      request: {
        user: { },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.sharingPost).toEqual(null);
    expect(result.errors[0].message).toEqual('author is undefined');
    // await new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve();
    //   }, 5000);
    // });
  });

  test('should throw error if author does not exist', async () => {
    const query = `
      mutation M3 { 
        sharingPost(_id:"${postId}") {
          user {
            _id
          }
          sharing {
            _id
            author {
              _id
            }
          }
          
        }
      }
    `;
    const rootValue = {
      request: {
        user: { id: userIdC },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.sharingPost).toEqual(null);
    expect(result.errors[0].message).toEqual('author does not exist');
    // await new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve();
    //   }, 5000);
    // });
  });

  afterEach(async () => {
    // clear data
    await UsersModel.remove({});
    await PostsModel.remove({});
  });
});
