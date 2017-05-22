import merge from 'lodash/merge';
import mongoose from 'mongoose';
import {
  // buildSchemaFromTypeDefinitions,
  makeExecutableSchema,
} from 'graphql-tools';
import {
  PostsModel,
  FriendsRelationModel as FriendsModel,
} from './models';
import Service from './mongo/service';
import AddressServices from './apis/AddressServices';
import NotificationsService from './apis/NotificationsService';
import UsersService from './apis/UsersService';
import PostsService from './apis/PostsService';
import { schema as schemaType, resolvers as resolversType } from './types';

const { Types: { ObjectId } } = mongoose;

const toObjectId = (idStr) => {
  let id = null;
  try {
    id = ObjectId(idStr);
  } catch (err) {
    throw err;
  }
  return id;
};

const rootSchema = [`
type Query {
  # A feed of repository submissions
  feed(limit: Int, cursor: String): Feeds
  post(_id: String!): Post
  user(_id: String): Friend
  # me: Me,
  apartment(_id: String): Apartment,
  building(_id: String): Building,
  notification(_id: String): Notification,
}

type Mutation {
  acceptFriend (
    userId: String!
  ): Friend
}

schema {
  query: Query
  mutation: Mutation
}
`];

const FeedsService = Service({
  Model: PostsModel,
  paginate: {
    default: 5,
    max: 10,
  },
  cursor: true,
});
const rootResolvers = {
  Query: {
    async feed({ request }, { cursor = null, limit = 5 }) {
      const userId = request.user.id;
      let friendListByIds = await FriendsModel.find({ user: userId }).select('friend _id');
      friendListByIds = friendListByIds.map(v => v.friend);
      friendListByIds.push(userId);
      friendListByIds = friendListByIds.map(toObjectId);
      const r = await FeedsService.find({
        $cursor: cursor,
        $field: 'author',
        query: {
          $or: [
            { author: userId },
            { user: { $in: friendListByIds } },
          ],
          $sort: {
            createdAt: -1,
          },
          $limit: limit,
        },
      });
      return {
        pageInfo: r.paging,
        edges: r.data,
      };
    },
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
  Mutation: {
    acceptFriend(root, { repoFullName }, context) {
      return UsersService.acceptFriend();
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
