import {
  GraphQLID as ID,
  GraphQLInt as Int,
  GraphQLNonNull as NonNull,
  GraphQLString as StringType,
  GraphQLObjectType as ObjectType,
  GraphQLList as List,
} from 'graphql';

import UserInterface from './UserInterface';
import PostInterface from './PostInterface';
import CommentInterface from './CommentInterface';

import {
  UsersModel,
  PostsModel,
  CommentsModel,
} from '../models';

const CommentSchemas = new ObjectType({
  name: 'CommentSchemas',
  description: 'CommentSchemas',
  interfaces: [CommentInterface],
  fields: {
    _id: { type: new NonNull(ID) },
    message: { type: StringType },
    post: {
      type: PostInterface,
      resolve: comment => PostsModel.findOne({ _id: comment.post }),
    },
    user: {
      type: UserInterface,
      resolve: comment => UsersModel.findOne({ _id: comment.user }),
    },
    totalReply: {
      type: Int,
      resolve: comment => CommentsModel.count({ reply: comment._id }),
    },
    updatedAt: {
      type: StringType,
    },
    reply: {
      type: new List(CommentInterface),
      resolve: comment => CommentsModel.find({ post: comment.post, reply: comment._id }),
    },
    parent: {
      type: StringType,
      resolve: comment => comment.reply,
    },
  },
});

export default CommentSchemas;
