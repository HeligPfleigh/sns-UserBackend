// import { property } from 'lodash';
import DateScalarType from './DateScalarType';
import reduce from 'lodash/reduce';
import {
  PostsModel,
  UsersModel,
  BuildingsModel,
  CommentsModel,
  ApartmentsModel,
  FriendsRelationModel,
  NotificationsModel,
} from '../models';

export const schema = [`
# scalar types
scalar Date

type Building {
  _id: ID!
  name: String
  
  createdAt: Date
  updatedAt: Date
}

type Apartment {
  _id: ID!
  number: Int
  building: Building
  user: Author
  isOwner: Boolean

  createdAt: Date
  updatedAt: Date
}

enum NotificationType {
  LIKES
  COMMENTS
  NEW_POST
}

type Notification {
  _id: ID!
  user: Author!
  type: NotificationType!
  seen: Boolean
  isRead: Boolean
  subject: Post
  actors: [Author]

  createdAt: Date
  updatedAt: Date
}

type Comment {
  _id: ID!
  message: String
  post: Post
  user: Author
  totalReply: Int
  reply: [Comment]

  createdAt: Date
  updatedAt: Date
}

type Post {
  _id: ID!
  message: String
  author: Author
  user : Friend
  totalLikes :Int
  totalComments : Int
  likes :[Author]
  comments : [Comment]
  createdAt: Date
  updatedAt: Date
}

type Profile {
  picture: String
  firstName: String
  lastName: String
  gender: String
}

interface User {
  _id: ID!
  username: String
  profile: Profile
  chatId: String
  posts: [Post]
  building: [Building]
  apartments: [Apartment]
  friends: [User]
}

type Me implements User {
  _id: ID!
  username: String
  profile: Profile
  chatId: String
  posts: [Post]
  friends: [Friend]

  building: [Building]
  apartments: [Apartment]
  friendRequests: [Friend]
  friendSuggestions: [Friend]
  totalFriends: Int
  totalNotification: Int

  createdAt: Date
  updatedAt: Date
}

type Friend implements User {
  _id: ID!
  username: String
  profile: Profile
  chatId: String
  posts: [Post]
  building: [Building]
  apartments: [Apartment]
  friends: [Friend]

  createdAt: Date
  updatedAt: Date
}

type Author implements User {
  _id: ID!
  username: String
  profile: Profile
  chatId: String
  posts: [Post]
  building: [Building]
  apartments: [Apartment]
  friends: [User]

  createdAt: Date
  updatedAt: Date
}

# Feeds
type PageInfo {
  endCursor: String
  hasNextPage: Boolean
  total: Int
  limit: Int
}

type Feeds {
  pageInfo: PageInfo
  edges: [Post]
}

type NotificationsResult {
  pageInfo: PageInfo
  edges: [Notification]
}
`];

export const resolvers = {
  Date: DateScalarType,
  Building: {
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
  },
  Apartment: {
    building(data) {
      return BuildingsModel.findOne({ _id: data.building });
    },
    user(data) {
      return UsersModel.findOne({ _id: data.author });
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
  },
  Notification: {
    user(notify) {
      return UsersModel.findOne({ _id: notify.user });
    },
    subject(notify) {
      return PostsModel.findById(notify.subject);
    },
    actors(notify) {
      return UsersModel.find({ _id: { $in: notify.actors } });
    },
  },
  Me: {
    posts(user) {
      return new Promise((resolve, reject) => {
        const edgesArray = [];
        const edges = PostsModel.find({ user: user._id }).sort({ createdAt: -1 }).cursor();

        edges.on('data', (res) => {
          res.likes.indexOf(user._id) !== -1 ? res.isLiked = true : res.isLiked = false;
          edgesArray.push(res);
        });

        edges.on('error', (err) => {
          reject(err);
        });
        edges.on('end', () => {
          resolve(edgesArray);
        });
      });
    },
    building(data) {
      return BuildingsModel.find({ _id: data.building });
    },
    apartments(data) {
      return ApartmentsModel.find({ user: data._id });
    },
    async friends(user) {
      let friendListByIds = await FriendsRelationModel.find({
        user: user._id,
        status: 'ACCEPTED',
      }).select('friend _id');
      friendListByIds = friendListByIds.map(v => v.friend);
      return UsersModel.find({
        _id: { $in: friendListByIds },
      });
    },
    async friendRequests(user) {
      let friendListByIds = await FriendsRelationModel.find({
        friend: user._id,
        status: 'PENDING',
      }).select('user _id');
      friendListByIds = friendListByIds.map(v => v.user);
      return UsersModel.find({
        _id: { $in: friendListByIds },
      });
    },
    async friendSuggestions(user) {
      const currentFriends = await FriendsRelationModel.find().or([{ user: user._id }, { friend: user._id }]).select('user friend _id');
      const ninIds = reduce(currentFriends, (result, item) => {
        result.push(item.user);
        result.push(item.friend);
        return result;
      }, []);
      ninIds.push(user._id);

      let usersId = await ApartmentsModel.find({
        user: { $nin: ninIds },
        building: user.building,
      }).select('user _id').limit(5);
      usersId = usersId.map(v => v.user);
      return UsersModel.find({
        _id: { $in: usersId },
      });
    },
    totalFriends(user) {
      return FriendsRelationModel.count({ user: user._id });
    },
    totalNotification(user) {
      return NotificationsModel.count({ user: user._id, seen: false });
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
  },
  Post: {
    user(data) {
      return UsersModel.findOne({ _id: data.user });
    },
    author(data) {
      return UsersModel.findOne({ _id: data.author });
    },
    totalLikes(data) {
      return data.likes.length;
    },
    totalComments(data) {
      return CommentsModel.count({
        post: data._id,
        reply: { $exists: false },
      });
    },
    comments(data, { _id, limit = 2 }) {
      const q = { post: data._id, reply: { $exists: false } };
      if (_id) {
        q._id = { $lt: _id };
      }
      return CommentsModel.find(q).sort({ createdAt: -1 }).limit(limit);
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
  },
  Friend: {
    posts(data) {
      return PostsModel.find({ user: data._id });
    },
    building(data) {
      return BuildingsModel.find({ _id: data.building });
    },
    apartments(data) {
      return ApartmentsModel.find({ user: data._id });
    },
    friends(data) {
      return FriendsRelationModel.find({ user: data._id, status: 'ACCEPTED' });
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
  },
  Author: {
    posts(data) {
      return PostsModel.find({ user: data._id });
    },
    building(data) {
      return BuildingsModel.find({ _id: data.building });
    },
    apartments(data) {
      return ApartmentsModel.find({ user: data._id });
    },
    friends() {
      return UsersModel.find({});
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },

  },
  Comment: {
    post(data) {
      return PostsModel.findOne({ _id: data.post });
    },
    user(data) {
      return UsersModel.findOne({ _id: data.user });
    },
    totalReply(data) {
      return CommentsModel.count({ reply: data._id });
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
    reply(data) {
      return CommentsModel.find({ post: data.post, reply: data._id });
    },
  },
};
