// import { property } from 'lodash';
import {
  PostsModel,
  UsersModel,
  BuildingsModel,
} from '../models';

export const schema = [`
type Building {
  _id: ID!
  name: String
}

type Apartment {
  _id: ID!
  number: Int
  building: Building
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
  createdAt: String
}

type Post {
  _id: ID!
  message: String
  user: Author
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
}
`];

export const resolvers = {
  Apartment: {
    building (data) {
      return BuildingsModel.findOne({_id: data.building});
    },
  },
  Me: {
    posts() {
      return PostsModel.find({});
    },
  },
  Post: {
    user(data) {
      return UsersModel.findOne({_id: data.user});
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
};
