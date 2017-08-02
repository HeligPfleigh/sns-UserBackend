import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { BuildingsModel, BuildingMembersModel, PostsModel } from '../models';
import { ADMIN, ACCEPTED, MEMBER } from '../../constants';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const buildingId = '58da279f0ff5af8c8be59c37';
const postId = '590310aec900da00047629a8';
const userId = '58f9c2502d4581000484b18a';
const buildingData = {
  _id: buildingId,
  name: 'Vinhomes Riverside',
  address: {
    country: 'vn',
    city: 'Ha Noi',
    state: 'Long Bien',
    street: 'No.7, Bang Lang 1 Street',
  },
  location: {
    coordinates: [105.7976544, 21.0714764],
    type: 'Point',
  },
  description: 'Vingroup Joint Stock Company',
  __v: 0,
};
const postData = {
  _id: postId,
  createdAt: '2017-04-28T09:51:42.263Z',
  updatedAt: '2017-04-28T09:51:42.263Z',
  message: '{"entityMap":{},"blocks":[{"key":"ckaun","text":"dsadsadsa","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]}',
  user: '58f9c3d52d4581000484b194',
  author: '58f9c3d52d4581000484b194',
  building: buildingId,
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

  test('should get building by id', async () => {
    // language=GraphQL
    const query = `
      {
        building (_id:"${buildingId}") {
          _id
          posts {
            _id
          }
          isAdmin
        }
      }
    `;

    const rootValue = {};
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.building).toEqual(Object.assign({}, {
      _id: buildingData._id,
      posts: [],
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
            _id
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
      posts: [],
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
            _id
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
      posts: [{
        _id: postId,
      }],
    }));

    await postModel.remove();
    await BuildingMembersModel.remove({
      building: buildingId,
      user: userId,
      type: MEMBER,
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
            _id
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
      posts: [],
    }));
  });

  afterEach(async () => {
    // clear data
    await BuildingsModel.remove({
      _id: buildingData._id,
    });
    await PostsModel.remove({
      _id: { $in: [postId] },
    });
  });
});
