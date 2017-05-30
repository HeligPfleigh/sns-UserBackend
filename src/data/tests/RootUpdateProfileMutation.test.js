import { graphql ,GraphQLString as StringType,
  GraphQLInputObjectType as InputObjectType} from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel, PostsModel, CommentsModel } from '../models';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userId = '58f9c1bf2d4581000474b198';
const buildingId = '58da279f0ff5af8c8be59c36';
const profile = {
  picture: 'https://graph.facebook.com/596825810516199/picture?type=large',
  firstName: 'Nam',
  lastName: 'Hoang',
  gender: 'male',
};
const userDataA = {
  _id: userId,
  emails: {
    address: 'particle4dev@gmail.com',
    verified: true,
  },
  username: 'particle4dev',
  profile,
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


describe('RootUpdateProfileMutation', () => {
  const newProfile =  {
      picture: "abc@gmail.com",
      firstName: "aa",
      lastName: "aa",
      gender: "aa",
    }
  beforeEach(async () => {
    // setup db
    // try {
    const user = new UsersModel(userDataA);
    await user.save();
  });
  test('should update profile ', async () => {
    // language=GraphQL
    const query = `
      mutation M { 
        updateProfile(
          profile:{ 
            picture: "abc@gmail.com",
            firstName: "aa",
            lastName: "aa",
            gender: "aa",}) 
        {
         _id
         profile{
           picture
           firstName
           lastName
           gender
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
    expect(result.data.updateProfile).toEqual(Object.assign({}, {
      _id: userId,
      profile : newProfile,
    }));
  });
  test('should check userId undefined', async () => {
    const query = `
      mutation M {
        updateProfile(profile:{  picture: "abc@gmail.com",
      firstName: "aa",
      lastName: "aa",
      gender: "aa",}) {
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
    expect(result.data.updateProfile).toEqual(null);
   expect(result.errors[0].message).toEqual('userId is undefined');
 });
  test('should check userId not exist', async () => {
    const query = `
      mutation M {
        updateProfile(profile:{  picture: "abc@gmail.com",
        firstName: "aa",
        lastName: "aa",
        gender: "aa",}) {
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
    expect(result.data.updateProfile).toEqual(null);
    expect(result.errors[0].message).toEqual('userId does not exist');
  });
  test('should check profile undefined', async () => {
    const query = `
      mutation M {
        updateProfile {
          _id
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
    expect(result.errors[0].message).toEqual('Field "updateProfile" argument "profile" of type "ProfileInput!" is required but not provided.');
  });
    test('should check gender undefined', async () => {
    const query = `
      mutation M {
        updateProfile(profile:{ 
         picture: "abc@gmail.com",
        firstName: "aa",
        lastName: "aa",
        }) {
          _id
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
    expect(result.data.updateProfile).toEqual(null);
    expect(result.errors[0].message).toEqual('gender is undefined');
  });
   test('should check picture undefined', async () => {
    const query = `
      mutation M {
        updateProfile(profile:{ 
        firstName: "aa",
        lastName: "aa",
        gender: "aa",}) {
          _id
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
    expect(result.data.updateProfile).toEqual(null);
    expect(result.errors[0].message).toEqual('picture is undefined');
  });
   test('should check firstName undefined', async () => {
    const query = `
      mutation M {
        updateProfile(profile:{ 
        picture: "abc@gmail.com",
        lastName: "aa",
        gender: "aa",}) {
          _id
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
    expect(result.data.updateProfile).toEqual(null);
    expect(result.errors[0].message).toEqual('firstName is undefined');
  });
   test('should check lastName undefined', async () => {
    const query = `
      mutation M {
        updateProfile(profile:{ 
        picture: "abc@gmail.com",
        firstName: "aa",
        gender: "aa",}) {
          _id
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
    expect(result.data.updateProfile).toEqual(null);
    expect(result.errors[0].message).toEqual('lastName is undefined');
  });
  afterEach(async () => {
    // clear data
    await UsersModel.remove({});
  });
});
