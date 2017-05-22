// import { property } from 'lodash';
import DateScalarType from './DateScalarType';
import {
  PostsModel,
  UsersModel,
  BuildingsModel,
  CommentsModel,
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
  user: Author

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
  Apartment: {
    building(data) {
      return BuildingsModel.findOne({ _id: data.building });
    },
  },
  Me: {
    posts() {
      return PostsModel.find({});
    },
  },
  Post: {
    user(data) {
      return UsersModel.findOne({ _id: data.user });
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
  },
  Friend: {
    posts() {
      return PostsModel.find({});
    },
  },
  Author: {
    posts() {
      return PostsModel.find({});
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
