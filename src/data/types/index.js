// import { property } from 'lodash';
import DateScalarType from './DateScalarType';
import {
  PostsModel,
  UsersModel,
  BuildingsModel,
  CommentsModel,
  ApartmentsModel,
  FriendsRelationModel,
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
  building: [Building]
  apartments: [Apartment]
  friends: [User]

  friendRequests: [User]
  friendSuggestions: [User]  
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
  friends: [User]

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
  edges: [Post],
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
    user(data) {
      return UsersModel.findOne({ _id: data.user });
    },
    subject(data) {
      return PostsModel.findOne({ _id: data.user });
    },
    actors(data) {
      return UsersModel.find({ user: data._id });
    },
  },
  Me: {
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
    friendRequests(data) {
      return FriendsRelationModel.find({ user: data._id, status: 'PENDING' });
    },
    friendSuggestions(data) {
      return FriendsRelationModel.find().or([{ user: data._id }, { friend: data._id }]);
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
