// import { property } from 'lodash';
import reduce from 'lodash/reduce';
import DateScalarType from './DateScalarType';
import {
  PostsModel,
  UsersModel,
  BuildingsModel,
  BuildingMembersModel,
  BuildingFeedModel,
  CommentsModel,
  ApartmentsModel,
  FriendsRelationModel,
  NotificationsModel,
} from '../models';
import { ADMIN, ACCEPTED, MEMBER, PENDING, PUBLIC, FRIEND } from '../../constants';

export const schema = [`
# scalar types
scalar Date

type Address {
  country: String
  city: String
  state: String
  street: String
}

type Building {
  _id: ID!
  name: String
  address: Address
  posts: [Post]
  isAdmin: Boolean
  requests( _id: String, limit: Int): [Friend]

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
  ACCEPTED_FRIEND
  FRIEND_REQUEST
}

enum PrivacyType {
  PUBLIC
  FRIEND
  ONLY_ME
}

enum PostType {
  STATUS
  EVENT
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
  parent: String

  createdAt: Date
  updatedAt: Date
}

type Post {
  _id: ID!
  message: String
  author: Author
  user: Friend
  building: Building
  totalLikes: Int
  totalComments: Int
  likes: [Author]
  comments( _id: String, limit: Int): [Comment]
  privacy: PrivacyType!
  type: PostType!
  isLiked: Boolean

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
  isFriend: Boolean

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
    posts(building, _, { user }) {
      if (!user) return [];
      return new Promise(async (resolve, reject) => {
        const edgesArray = [];
        const r = await BuildingMembersModel.findOne({
          user: user.id,
          building: building._id,
          status: ACCEPTED,
        });
        if (!r) {
          return resolve([]);
        }
        let ids = await BuildingFeedModel.find({ building: building._id }).sort({ createdAt: -1 });
        ids = ids.map(v => v.post);
        const edges = PostsModel.find({ _id: { $in: ids } }).sort({ createdAt: -1 }).cursor();

        edges.on('data', (res) => {
          res.likes.indexOf(user.id) !== -1 ? res.isLiked = true : res.isLiked = false;
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
    isAdmin(building, _, { user }) {
      if (!user) return false;
      return new Promise(async (resolve) => {
        if (await BuildingMembersModel.findOne({
          building: building._id,
          user: user.id,
          type: ADMIN,
          status: ACCEPTED,
        })) return resolve(true);
        return resolve(false);
      });
    },
    async requests(building, { _id, limit = 2 }) {
      const q = {
        building: building._id,
        type: MEMBER,
        status: PENDING,
      };
      if (_id) {
        q._id = { $lt: _id };
      }
      let bm = await BuildingMembersModel.find(q).sort({ createdAt: -1 }).limit(limit);
      bm = bm.map(v => v.user);
      return UsersModel.find({ _id: { $in: bm } });
    },
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
    posts(data) {
      return new Promise((resolve, reject) => {
        const edgesArray = [];
        const edges = PostsModel.find({ user: data._id }).sort({ createdAt: -1 }).cursor();

        edges.on('data', (res) => {
          res.likes.indexOf(data._id) !== -1 ? res.isLiked = true : res.isLiked = false;
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
    building(data) {
      return BuildingsModel.findOne({ _id: data.building });
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
    posts(data, _, { user }) {
      return new Promise(async (resolve, reject) => {
        // check if they are friend
        const r = await FriendsRelationModel.findOne({
          friend: user.id,
          user: data._id,
          status: ACCEPTED,
        });
        const select = {
          user: data._id,
        };
        if (r) {
          select.privacy = [PUBLIC, FRIEND];
        } else {
          select.privacy = [PUBLIC];
        }
        const edgesArray = [];
        const edges = PostsModel.find(select).sort({ createdAt: -1 }).cursor();

        edges.on('data', (res) => {
          res.likes.indexOf(user.id) !== -1 ? res.isLiked = true : res.isLiked = false;
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
    friends(data) {
      return FriendsRelationModel.find({ user: data._id, status: 'ACCEPTED' });
    },
    async isFriend(data, _, { user }) {
      return !!await FriendsRelationModel.findOne({
        friend: user.id,
        user: data._id,
        status: ACCEPTED,
      });
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
    parent(comment) {
      return comment.reply;
    },
  },
};
