import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
  GraphQLList as List,
} from 'graphql';

import UserInterface from './UserInterface';
import NotificationInterface from './NotificationInterface';
import PostInterface from './PostInterface';

import {
  UsersModel,
  PostsModel,
} from '../models';

const NotificationSchemas = new ObjectType({
  name: 'NotificationSchemas',
  interfaces: [NotificationInterface],
  fields: {
    _id: { type: new NonNull(ID) },
    user: {
      type: UserInterface,
      resolve: notify => UsersModel.findOne({ _id: notify.user }),
    },
    type: {
      type: StringType,
      resolve: notify => notify.type,
    },
    seen: {
      type: BooleanType,
      resolve: notify => notify.seen,
    },
    subject: {
      type: PostInterface,
      resolve: notify => PostsModel.findById(notify.subject),
    },
    actors: {
      type: new List(UserInterface),
      resolve: notify => UsersModel.find({ _id: { $in: notify.actors } }),
    },
    isRead: {
      type: BooleanType,
    },
    createdAt: {
      type: StringType,
      resolve: notify => notify.createdAt,
    },
  },
});

export default NotificationSchemas;
