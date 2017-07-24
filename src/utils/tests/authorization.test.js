import {
  makeExecutableSchema,
} from 'graphql-tools';
import { graphql } from 'graphql';
import {
  getContext,
} from '../../../test/helper';
import {
  everyone,
  authenticated,
  isRole,
  relation,
  can,
  onlyMe,
  friend,
} from '../authorization';

const rootSchema = [`
type Test {
  hello: String
}

type Query { 
  test: Test
}

schema {
  query: Query
}
`];

const fakeUserRequest = {
  id: '58f9c1bf2d4581000484b188',
  profile: {
    picture: 'https://graph.facebook.com/596825810516199/picture?type=large',
    firstName: 'Nam',
    lastName: 'Hoang',
    gender: 'male',
  },
  email: 'particle4dev@gmail.com',
  roles: ['user'],
  chatToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI0cDR2SU16WXdVaGlGaXFiQk1nZ2NiQUl0WDAzIiwiaWF0IjoxNTAwNjk5MjA1LCJleHAiOjE1MDA3MDI4MDUsImF1ZCI6Imh0dHBzOi8vaWRlbnRpdHl0b29sa2l0Lmdvb2dsZWFwaXMuY29tL2dvb2dsZS5pZGVudGl0eS5pZGVudGl0eXRvb2xraXQudjEuSWRlbnRpdHlUb29sa2l0IiwiaXNzIjoiZmlyZWJhc2UtYWRtaW5zZGstMWd5c2RAc25zLWNoYXQtZGV2LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoiZmlyZWJhc2UtYWRtaW5zZGstMWd5c2RAc25zLWNoYXQtZGV2LmlhbS5nc2VydmljZWFjY291bnQuY29tIn0.rJeb9h-6gM6LbyRwEUZu2LBPQ_my0OvKJRfLZ6LGWjjG6_IKjNLIo-maTpFz54FhidPzM2U2XWIg_DfFV8Ohm5RLHNPUX1U6X0EkYSdbTM_Iy00BIFq16HgNQbKRcKcdfKxIyLoLQrGNbUNQcWD2fsQ8n89XHYnF9rl7tBa_Jx2hAUI1BiOt0R4tHnXM16QlFive6sbnWQog1o48PheSklQ2tG9O1QUVM9bAv6PLBFOpRBGiwXlVNEBcx0W_DZWemu5h3rEWle7DEOEhfYOqJXQRZ_PeI_ihUoTkdCW3EeLv238PC6FsRt5ePO3ZvF1GZMQUrD4wgXb07EyBsNdXEA',
  chatExp: 1500699205,
  chatId: '4p4vIMzYwUhiFiqbBMggcbAItX03',
  iat: 1500699205,
  exp: 1516251205,
};

function wait(number = 3000) {
  return new Promise((resolve) => {
    setTimeout(resolve, number);
  });
}

describe('authorization', () => {
  // beforeEach(async () => {
  //   console.log('beforeEach');
  // });

  describe('everyone', () => {
    const rootResolvers = {
      Query: {
        @everyone
        test() {
          return {
            hello: 'world',
          };
        },
      },
    };
    const schema = makeExecutableSchema({
      typeDefs: rootSchema,
      resolvers: rootResolvers,
    });
    test('should return data', async () => {
      const query = `
        {
          test {
            hello
          }
        }
      `;

      const rootValue = {
        request: {
          user: fakeUserRequest,
        },
      };
      const context = getContext({
        user: fakeUserRequest,
      });
      const result = await graphql(schema, query, rootValue, context);
      expect(result.data.test).toEqual({ hello: 'world' });
    });
  });

  describe('authenticated', () => {
    const rootResolvers = {
      Query: {
        @authenticated
        test() {
          return {
            hello: 'world',
          };
        },
      },
    };
    const schema = makeExecutableSchema({
      typeDefs: rootSchema,
      resolvers: rootResolvers,
    });
    test('should return data', async () => {
      const query = `
        {
          test {
            hello
          }
        }
      `;

      const rootValue = {
        request: {
          user: fakeUserRequest,
        },
      };
      const context = getContext({
        user: fakeUserRequest,
      });
      const result = await graphql(schema, query, rootValue, context);
      expect(result.data.test).toEqual({ hello: 'world' });
    });

    test('should throw new error', async () => {
      const query = `
        {
          test {
            hello
          }
        }
      `;

      const rootValue = {};
      const context = getContext({});
      const result = await graphql(schema, query, rootValue, context);
      expect(result.errors[0].message).toEqual('you have not authority to access this data');
    });
  });
  // describe('isRole', () => {
  //   test('', async () => {
  //     console.log(JSON.stringify(result));
  //     await wait();
  //   });
  // });
  // describe('relation', () => {
  //   test('', async () => {
  //   });
  // });
  describe('can', () => {
    const rootResolvers = {
      Query: {
        @authenticated
        @can('create', 'post')
        test() {
          return {
            hello: 'world',
          };
        },
      },
    };
    const schema = makeExecutableSchema({
      typeDefs: rootSchema,
      resolvers: rootResolvers,
    });
    test('should return data', async () => {
      const query = `
        {
          test {
            hello
          }
        }
      `;

      const rootValue = {
        request: {
          user: fakeUserRequest,
        },
      };
      const context = getContext({
        user: fakeUserRequest,
      });
      const result = await graphql(schema, query, rootValue, context);
      expect(result.data.test).toEqual({ hello: 'world' });
    });
  });
  describe('onlyMe', () => {
    const rootResolvers = {
      Query: {
        @authenticated
        @onlyMe('request.user.id')
        test() {
          return {
            hello: 'world',
          };
        },
      },
    };
    const schema = makeExecutableSchema({
      typeDefs: rootSchema,
      resolvers: rootResolvers,
    });
    test('should return data', async () => {
      const query = `
        {
          test {
            hello
          }
        }
      `;

      const rootValue = {
        request: {
          user: fakeUserRequest,
        },
      };
      const context = getContext({
        user: fakeUserRequest,
      });
      const result = await graphql(schema, query, rootValue, context);
      expect(result.data.test).toEqual({ hello: 'world' });
    });
  });
  // afterEach(async () => {
  //   console.log('afterEach');
  // });
});
