import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { BuildingsModel, BuildingMembersModel, PostsModel } from '../models';
import { ADMIN, ACCEPTED, MEMBER, PUBLIC, ONLY_ADMIN_BUILDING, } from '../../constants';
import { buildingData as bd } from './data';
// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const buildingId = '58da279f0ff5af8c8be59c37';
const postId = '590310aec900da00047629a8';
const userId = '58f9c2502d4581000484b18a';
const buildingData = Object.assign({}, bd, {
  _id: buildingId,
});
const postData = {
  _id: postId,
  createdAt: '2017-04-28T09:51:42.263Z',
  updatedAt: '2017-04-28T09:51:42.263Z',
  message: '{"entityMap":{},"blocks":[{"key":"ckaun","text":"dsadsadsa","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]}',
  user: null,
  author: '58f9c3d52d4581000484b194',
  building: buildingId,
  privacy: PUBLIC,
  likes: [],
  photos: [],
  type: 'STATUS',
  __v: 0,
};
const postDataB = {
  _id: '590310aec900da00047629a9',
  createdAt: '2017-04-28T09:51:42.263Z',
  updatedAt: '2017-04-28T09:51:42.263Z',
  message: '{"entityMap":{},"blocks":[{"key":"ckaun","text":"dsadsadsa","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]}',
  user: null,
  author: '58f9c3d52d4581000484b194',
  building: buildingId,
  privacy: ONLY_ADMIN_BUILDING,
  likes: [],
  photos: [],
  type: 'STATUS',
  __v: 0,
};

describe('RootBuildingQuery', () => {
  beforeEach(async () => {
    // setup db
    const building = new BuildingsModel(buildingData);
    await building.save();
  });

  test('should get building by id (not login)', async () => {
    // language=GraphQL
    const query = `
      {
        building (_id:"${buildingId}") {
          _id
          posts {
            edges {
              _id
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
          isAdmin
        }
      }
    `;

    const rootValue = {};
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    // console.log(JSON.stringify(result));
    // await new Promise(resolve => setTimeout(resolve, 5000));
    expect(result.data.building).toEqual(Object.assign({}, {
      _id: buildingData._id,
      posts: {
        edges: [],
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
        },
      },
      isAdmin: false,
    }));
  });

  test('should get building with isAdmin equal true by id', async () => {
    await BuildingMembersModel.create({
      building: buildingId,
      user: userId,
      type: ADMIN,
      status: ACCEPTED,
    });
    // language=GraphQL
    const query = `
      {
        building (_id:"${buildingId}") {
          _id
          posts {
            edges {
              _id
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
          isAdmin
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
    const context = getContext({
      user: {
        id: userId,
      },
    });
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.building).toEqual(Object.assign({}, {
      _id: buildingData._id,
      posts: {
        edges: [],
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
        },
      },
      isAdmin: true,
    }));

    await BuildingMembersModel.remove({
      building: buildingId,
      user: userId,
      type: ADMIN,
      status: ACCEPTED,
    });
  });

  test('should get posts on building by id', async () => {
    const postModel = new PostsModel(postData);
    await postModel.save();
    const postModel2 = new PostsModel(postDataB);
    await postModel2.save();
    await BuildingMembersModel.create({
      building: buildingId,
      user: userId,
      type: MEMBER,
      status: ACCEPTED,
    });
    // language=GraphQL
    const query = `
      {
        building (_id:"${buildingId}") {
          _id
          posts {
            edges {
              _id
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = getContext({
      user: { id: userId },
    });
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.building).toEqual(Object.assign({}, {
      _id: buildingData._id,
      posts: {
        edges: [
          {
            _id: '590310aec900da00047629a8',
          },
        ],
        pageInfo: {
          endCursor: '590310aec900da00047629a8',
          hasNextPage: false,
        },
      },
    }));

    await postModel.remove();
    await postModel2.remove();
    await BuildingMembersModel.remove({
      building: buildingId,
      user: userId,
      type: MEMBER,
      status: ACCEPTED,
    });
  });

  test('should get 2 posts on building if user is author', async () => {
    const uid = '58f9c3d52d4581000484b194';
    const postModel = new PostsModel(postData);
    await postModel.save();
    const postModel2 = new PostsModel(postDataB);
    await postModel2.save();
    await BuildingMembersModel.create({
      building: buildingId,
      user: uid,
      type: MEMBER,
      status: ACCEPTED,
    });
    // language=GraphQL
    const query = `
      {
        building (_id:"${buildingId}") {
          _id
          posts {
            edges {
              _id
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = getContext({
      user: { id: uid },
    });
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.building).toEqual(Object.assign({}, {
      _id: buildingData._id,
      posts: {
        edges: [
          {
            _id: '590310aec900da00047629a9',
          },
          {
            _id: '590310aec900da00047629a8',
          },
        ],
        pageInfo: {
          endCursor: '590310aec900da00047629a8',
          hasNextPage: false,
        },
      },
    }));

    await postModel.remove();
    await postModel2.remove();
    await BuildingMembersModel.remove({
      building: buildingId,
      user: uid,
      type: MEMBER,
      status: ACCEPTED,
    });
  });

  test('should get posts on building by id (ADMIN)', async () => {
    const postModel = new PostsModel(postData);
    await postModel.save();
    const postModel2 = new PostsModel(postDataB);
    await postModel2.save();
    await BuildingMembersModel.create({
      building: buildingId,
      user: userId,
      type: ADMIN,
      status: ACCEPTED,
    });
    // language=GraphQL
    const query = `
      {
        building (_id:"${buildingId}") {
          _id
          posts {
            edges {
              _id
            }
            pageInfo {
              endCursor
              hasNextPage
              total
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = getContext({
      user: { id: userId },
    });
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.building).toEqual(Object.assign({}, {
      _id: buildingData._id,
      posts: {
        edges: [
          {
            _id: '590310aec900da00047629a8',
          },
          {
            _id: '590310aec900da00047629a9',
          },
        ],
        pageInfo: {
          endCursor: '590310aec900da00047629a9',
          hasNextPage: true,
          total: 2,
        },
      },
    }));

    await postModel.remove();
    await postModel2.remove();
    await BuildingMembersModel.remove({
      building: buildingId,
      user: userId,
      type: ADMIN,
      status: ACCEPTED,
    });
  });


  test('should get empty posts if user is not member of building', async () => {
    const userId2 = '59f9c2502d4581000484b18a';
    // language=GraphQL
    const query = `
      {
        building (_id:"${buildingId}") {
          _id
          posts {
            edges {
              _id
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
    `;

    const rootValue = {};
    const context = getContext({
      user: { id: userId2 },
    });
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.building).toEqual(Object.assign({}, {
      _id: buildingData._id,
      posts: {
        edges: [],
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
        },
      },
    }));
  });

  afterEach(async () => {
    // clear data
    await BuildingsModel.remove({});
    await PostsModel.remove({});
    await BuildingMembersModel.remove({});
  });
});
