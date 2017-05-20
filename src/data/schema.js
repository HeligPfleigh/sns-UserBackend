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
import AddressServices from './apis/AddressServices';
import NotificationsService from './apis/NotificationsService';
import UsersService from './apis/UsersService';
import PostsService from './apis/PostsService';
import { schema as schemaType, resolvers as resolversType } from './types';

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
  # feed(limit: Int): [Entry]
  post(_id: String!): Post
  user(_id: String): Friend
  # me: Me,
  apartment(_id: String): Apartment,
  building(_id: String): Building,
  notification(_id: String): Notification,
}

schema {
  query: Query
}
`];
const rootResolvers = {
  Query: {
    post(root, { _id }, context) {
      return PostsService.getPost(_id);
    },
    apartment(root, { _id }, context) {
      return AddressServices.getApartment(_id);
    },
    building(root, { _id }, context) {
      return AddressServices.getBuilding(_id);
    },
    user(root, { _id }, context) {
      return UsersService.getUser(_id);
    },
    notification(root, { _id }, context) {
      return NotificationsService.getNotification(_id);
    },
  },
};

const schema = [...rootSchema, ...schemaType];
const resolvers = merge(rootResolvers, resolversType);

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});

export default executableSchema;

/**
> Refactor
  - short
  - nice syntax

> api
> mutation

> test 
> micro-service

> paging mongo
> realtime
*/