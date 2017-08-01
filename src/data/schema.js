import merge from 'lodash/merge';
import isUndefined from 'lodash/isUndefined';
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
  BuildingMembersModel,
  UsersModel,
  BuildingFeedModel,
} from './models';
import Service from './mongo/service';
import AddressServices from './apis/AddressServices';
import NotificationsService from './apis/NotificationsService';
import UsersService from './apis/UsersService';
import PostsService from './apis/PostsService';
import CommentService from './apis/CommentService';
import { schema as schemaType, resolvers as resolversType } from './types';
import { ADMIN, PENDING, REJECTED, ACCEPTED, PUBLIC, FRIEND } from '../constants';
// import {
//   everyone,
//   authenticated,
//   isRole,
//   relation,
//   can,
//   onlyMe,
// } from '../utils/authorization';

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
type Test {
  hello: String
}

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
  search(keyword: String!, numberOfFriends: Int): [Friend]
  # users,
  test: Test
  resident(_id: String): User
}

input ProfileInput {
  picture: String
  firstName: String
  lastName: String
  gender: String
}

input UpdateUserProfileInput {
  userId: String!
  profile: ProfileInput
}

type UpdateUserProfilePayload {
  user: User
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
    message: String!
    commentId: String
  ): Comment
  createNewPost (
    message: String!
    userId: String
    privacy: PrivacyType
  ): Post
  editPost (
    _id: String!
    message: String!
  ): Post
  deletePost (
    _id:String!
  ): Post
  deletePostOnBuilding (
    postId: String!
    buildingId: String!
  ): Post
  updateProfile(
    profile: ProfileInput!
  ): Author
  updateSeen: Notification
  updateRead(
    _id: String!
  ): Notification
  createNewPostOnBuilding (
    message: String!
    buildingId: String!
  ): Post
  acceptRequestForJoiningBuilding(
    buildingId: String!
    userId: String!
  ): Friend
  rejectRequestForJoiningBuilding(
    buildingId: String!
    userId: String!
  ): Friend
  sharingPost(
    _id: String!,
    privacy: String!,
    message: String!
  ): Post

  updateUserProfile(
    input: UpdateUserProfileInput!
  ): UpdateUserProfilePayload
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
      const me = await UsersModel.findOne({ _id: userId });
      let friendListByIds = await FriendsModel.find({
        user: userId,
        isSubscribe: true,
      }).select('friend _id');
      friendListByIds = friendListByIds.map(v => v.friend);
      friendListByIds.push(userId);
      friendListByIds = friendListByIds.map(toObjectId);
      const r = await FeedsService.find({
        $cursor: cursor,
        $field: 'author',
        query: {
          $or: [
            { author: userId }, // post from me
            {
              user: { $in: friendListByIds },
              privacy: { $in: [PUBLIC, FRIEND] },
            },
            {
              building: me.building,
              privacy: { $in: [PUBLIC] },
            },
          ],
          isDeleted: { $exists: false },
          $sort: {
            createdAt: -1,
          },
          $limit: limit,
        },
      });
      return {
        pageInfo: r.paging,
        edges: r.data.map((res) => {
          res.likes.indexOf(userId) !== -1 ? res.isLiked = true : res.isLiked = false;
          return res;
        }),
      };
    },
    async post({ request }, { _id }) {
      const userId = request.user.id;
      const res = await PostsService.getPost(_id);
      res.likes.indexOf(userId) !== -1 ? res.isLiked = true : res.isLiked = false;
      return res;
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
      const userId = request.user.id;
      const r = await NotificationsPagingService.find({
        $cursor: cursor,
        query: {
          $sort: {
            createdAt: -1,
          },
          user: userId,
          $limit: limit,
        },
      });
      return {
        pageInfo: r.paging,
        edges: r.data,
      };
    },
    async search({ request }, { keyword, numberOfFriends = 1000 }) {
      // no select password
      const userId = request.user.id;
      const u = await UsersModel.findOne({
        _id: userId,
      });
      const r = await UsersModel.find({
        _id: { $nin: [u._id] },
        building: u.building,
        $text: {
          $search: keyword,
          $caseSensitive: false,
        },
      }, {
        score: { $meta: 'textScore' },
      })
        .sort({ score: { $meta: 'textScore' } })
        .limit(numberOfFriends);
      return r;
    },
    // @authenticated
    // @can('create', 'post')
    // test() {
    //   return {
    //     hello: 'world',
    //   };
    // },
    resident(root, { _id }) {
      return UsersService.getUser(_id);
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
    createNewPost({ request }, { message, userId, privacy = PUBLIC }) {
      // NOTE:
      // userId: post on friend wall
      if (!message.trim()) {
        throw new Error('you can not create a new post with empty message');
      }
      return PostsService.createNewPost(request.user.id, message, userId, privacy);
    },
    async deletePost({ request }, { _id }) {
      const p = await PostsModel.findOne({
        _id,
        author: request.user.id,
      });
      if (!p) {
        throw new Error('not found the post');
      }
      await PostsModel.update({
        _id,
        author: request.user.id,
      }, {
        $set: {
          isDeleted: true,
        },
      });
      return p;
    },
    async deletePostOnBuilding({ request }, { postId, buildingId }) {
      const p = await PostsModel.findOne({
        _id: postId,
        author: request.user.id,
        building: buildingId,
      });
      if (!p) {
        throw new Error('not found the post');
      }
      await PostsModel.update({
        _id: postId,
        author: request.user.id,
        building: buildingId,
      }, {
        $set: {
          isDeleted: true,
        },
      });
      await BuildingFeedModel.remove({
        building: buildingId,
        post: postId,
      });
      return p;
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
    createNewPostOnBuilding({ request }, { message, buildingId }) {
      // NOTE:
      // buildingId: post on building
      return PostsService.createNewPostOnBuilding(request.user.id, message, buildingId);
    },
    async acceptRequestForJoiningBuilding({ request }, { buildingId, userId }) {
      const isAdmin = await BuildingMembersModel.findOne({
        building: buildingId,
        user: request.user.id,
      });
      if (!isAdmin || isAdmin.type !== ADMIN) {
        throw new Error('you don\'t have permission to reject request');
      }
      const record = await BuildingMembersModel.findOne({
        building: buildingId,
        user: userId,
      });
      if (!record) {
        throw new Error('not found the request');
      }
      if (record.status !== PENDING) {
        return UsersModel.findOne({ _id: userId });
      }
      // NOTE: what happens if we lost connection to db
      await BuildingMembersModel.update({
        building: buildingId,
        user: userId,
      }, {
        $set: {
          status: ACCEPTED,
        },
      });
      return UsersModel.findOne({ _id: userId });
      // return new Promise(async (resolve, reject) => {
      //   setTimeout(reject, 5000);
      // });
    },
    async rejectRequestForJoiningBuilding({ request }, { buildingId, userId }) {
      const isAdmin = await BuildingMembersModel.findOne({
        building: buildingId,
        user: request.user.id,
      });
      if (!isAdmin || isAdmin.type !== ADMIN) {
        throw new Error('you don\'t have permission to reject request');
      }
      const record = await BuildingMembersModel.findOne({
        building: buildingId,
        user: userId,
      });
      if (!record) {
        throw new Error('not found the request');
      }
      if (record.status !== PENDING) {
        return UsersModel.findOne({ _id: userId });
      }
      // NOTE: what happens if we lost connection to db
      await BuildingMembersModel.update({
        building: buildingId,
        user: userId,
      }, {
        $set: {
          status: REJECTED,
        },
      });
      return UsersModel.findOne({ _id: userId });
    },
    async editPost({ request }, { _id, message }) {
      const p = await PostsModel.findOne({
        _id,
      });
      if (!p) {
        throw new Error('not found the post');
      }
      await PostsModel.update({
        _id,
      }, {
        $set: {
          message,
        },
      });
      return PostsModel.findOne({
        _id,
      });
    },
    async sharingPost({ request }, { _id, privacy = PUBLIC, message }) {
      const author = request.user.id;
      const p = await PostsModel.findOne({ _id });
      if (isUndefined(author)) {
        throw new Error('author is undefined');
      }
      if (!await UsersModel.findOne({ _id: author })) {
        throw new Error('author does not exist');
      }
      if (!p) {
        throw new Error('Not found the post');
      } else {
        const sharingId = p.sharing;
        if (!sharingId) {
          const r = await PostsModel.create({
            author,
            user: author,
            privacy,
            sharing: _id,
            message,
          });
          r.isLiked = false;
          return r;
        }
        const r = await PostsModel.create({
          author,
          user: author,
          privacy,
          sharing: sharingId,
          message,
        });
        r.isLiked = false;
        return r;
      }
      // JSON.parse(message);
    },
    async updateUserProfile({ request }, { input }) {
      const {
        userId,
        profile,
      } = input;
      if (request.user.id !== userId) {
        throw new Error('not author');
      }
      const update = {
        $set: {},
      };
      if (profile.firstName) {
        update.$set['profile.firstName'] = profile.firstName;
      }
      if (profile.gender) {
        update.$set['profile.gender'] = profile.gender;
      }
      if (profile.lastName) {
        update.$set['profile.lastName'] = profile.lastName;
      }
      await UsersModel.update({
        _id: userId,
      }, update);
      return {
        user: await UsersModel.findOne({
          _id: userId,
        }),
      };
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
