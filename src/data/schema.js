import merge from 'lodash/merge';
import mongoose from 'mongoose';
import {
  // buildSchemaFromTypeDefinitions,
  makeExecutableSchema,
} from 'graphql-tools';
import {
  PostsModel,
  FriendsRelationModel as FriendsModel,
  CommentsModel,
  NotificationsModel,
} from './models';
import Service from './mongo/service';
import AddressServices from './apis/AddressServices';
import NotificationsService from './apis/NotificationsService';
import UsersService from './apis/UsersService';
import PostsService from './apis/PostsService';
import CommentService from './apis/CommentService';

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
  feeds(limit: Int, cursor: String): Feeds
  post(_id: String!): Post
  user(_id: String): Friend
  me: Me,
  apartment(_id: String): Apartment
  building(_id: String): Building
  notification(_id: String): Notification
  comment(_id: String): Comment
  notifications(limit: Int, cursor: String): NotificationsResult
  # users,
}
input ProfileInput {
  picture: String
  firstName: String
  lastName: String
  gender:String
}
type Mutation {
  acceptFriend (
    _id: String!
  ): Friend
  rejectFriend (
    _id: String!
  ): Friend
  sendFriendRequest(
    _id: String!
  ): Friend
  likePost(
    _id: String!
  ): Post
  unlikePost(
    _id: String!
  ): Post
  createNewComment(
    _id:String!
    message : String!
    commentId : String
  ):Comment
  createNewPost (
    message:String!
  ):Post
  updateProfile(
    profile:ProfileInput!
  ):Author
  updateSeen(
    _id:String!
  ):Notification
  updateRead(
    _id:String!
  ):Notification
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
const NotificationsPagingService = Service({
  Model: NotificationsModel,
  paginate: {
    default: 5,
    max: 10,
  },
  cursor: true,
});
const rootResolvers = {
  Query: {
    async feeds({ request }, { cursor = null, limit = 5 }) {
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
    post(root, { _id }) {
      return PostsService.getPost(_id);
    },
    apartment(root, { _id }) {
      return AddressServices.getApartment(_id);
    },
    building(root, { _id }) {
      return AddressServices.getBuilding(_id);
    },
    user(root, { _id }) {
      return UsersService.getUser(_id);
    },
    notification(root, { _id }) {
      return NotificationsService.getNotification(_id);
    },
    comment(root, { _id }) {
      return CommentsModel.findOne({ _id });
    },
    me({ request }) {
      return UsersService.getUser(request.user.id);
    },
    async notifications({ request }, { cursor = null, limit = 20 }) {
      console.log('12');
      const userId = request.user.id;
      console.log(userId);
      const r = await NotificationsPagingService.find({
        $cursor: cursor,
        query: {
          user: userId,
          $limit: limit,
        },
      });
      return {
        pageInfo: r.paging,
        edges: r.data,
      };
    },
  },
  Mutation: {
    acceptFriend({ request }, { _id }) {
      return UsersService.acceptFriend(request.user.id, _id);
    },
    rejectFriend({ request }, { _id }) {
      return UsersService.rejectFriend(request.user.id, _id);
    },
    sendFriendRequest({ request }, { _id }) {
      return UsersService.sendFriendRequest(request.user.id, _id);
    },
    likePost({ request }, { _id }) {
      return PostsService.likePost(request.user.id, _id);
    },
    unlikePost({ request }, { _id }) {
      return PostsService.unlikePost(request.user.id, _id);
    },
    createNewComment({ request }, { _id, message, commentId }) {
      return CommentService.createNewComment(request.user.id, _id, message, commentId);
    },
    createNewPost({ request }, { message }) {
      return PostsService.createNewPost(request.user.id, message);
    },
    updateProfile({ request }, { profile }) {
      return UsersService.updateProfile(request.user.id, profile);
    },
    updateSeen({ request }, { _id }) {
      return NotificationsService.updateSeen(request.user.id, _id);
    },
    updateRead({ request }, { _id }) {
      return NotificationsService.updateRead(request.user.id, _id);
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
