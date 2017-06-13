import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { BuildingsModel, BuildingFeedModel, PostsModel } from '../models';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const buildingId = '58da279f0ff5af8c8be59c37';
const postId = '590310aec900da00047629a8';
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
  likes: [],
  photos: [],
  type: 'STATUS',
  __v: 0,
};
const buildingFeed = {
  post: postId,
  building: buildingId,
};

describe('RootBuildingQuery', () => {
  beforeEach(async () => {
    // setup db
    const building = new BuildingsModel(buildingData);
    await building.save();
    const postModel = new PostsModel(postData);
    await postModel.save();
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
        }
      }
    `;

    const rootValue = {};
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.building).toEqual(Object.assign({}, {
      _id: buildingData._id,
      posts: [],
    }));
  });

  test('should get posts on building by id', async () => {
    const b = new BuildingFeedModel(buildingFeed);
    await b.save();
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
      user: { id: '58f9c1bf2d4581000484b188' },
    });
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.building).toEqual(Object.assign({}, {
      _id: buildingData._id,
      posts: [{
        _id: postId,
      }],
    }));

    await b.remove();
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
