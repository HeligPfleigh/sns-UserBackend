/**
import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

// import queries from './queries';
// import mutation from './mutation';
import schemas from './schemas';
import { UsersModel } from './models';

const schema = makeExecutableSchema({
  typeDefs: schemas,
  resolvers: {
    Query: {
      building({ request }, { _id }) {
        return {
          _id,
        };
      },
      user({ request }, { _id }) {
        return UsersModel.findOne({ _id });
      },
      users() {
        return UsersModel.find({});
      },
    },
  },
});
// const schema = new Schema({
//   query: new ObjectType({
//     name: 'RootQuery',
//     fields: queries,
//   }),
//   mutation: new ObjectType({
//     name: 'RootMutation',
//     fields: mutation,
//   }),
// });

// export default schema;
*/
import merge from 'lodash/merge';
import {
  // buildSchemaFromTypeDefinitions,
  makeExecutableSchema,
} from 'graphql-tools';
import { PostsModel, UsersModel } from './models';

import { schema as userSchema, resolvers as userResolvers } from './zzz';

const rootSchema = [`

# A list of options for the sort order of the feed
enum FeedType {
  # Sort by a combination of freshness and score, using Reddit's algorithm
  HOT
  # Newest entries first
  NEW
  # Highest score entries first
  TOP
}

type Entry {
  # The SQL ID of this entry
  _id: Int!

  # The sort order for the feed
  type: FeedType!,

  user: Author!
}

type Query {
  # A feed of repository submissions
  feed(limit: Int): [Entry]
  post(_id: String!): Post
  user(_id: String): Author
  me: Me,
  apartment(_id: String): Apartment,
  building(_id: String): Apartment,
  notifications: [Notification],
}

schema {
  query: Query
}
`];
const rootResolvers = {
  Query: {
    feed(root, { limit }, context) {
      console.log(root, limit, context);
      return [
        {
          _id: limit,
          type: 'NEW',
          user: {
            _id: '123',
          },
        },
      ];
    },
    post(root, { _id }, context) {
      return PostsModel.findOne({_id});
    }
  },
};

const schema = [...rootSchema, ...userSchema];
const resolvers = merge(rootResolvers, userResolvers);

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});

export default executableSchema;

/**
> Refactor
  - short
  - nic syntax

> test 
> micro-service
*/