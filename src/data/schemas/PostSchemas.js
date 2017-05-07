import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLInt as Int,
  GraphQLBoolean as BooleanType,
  GraphQLList as List,
} from 'graphql';

import UserInterface from './UserInterface';
import PostInterface from './PostInterface';
import CommentSchemas from './CommentSchemas';

import {
  UsersModel,
  CommentsModel,
} from '../models';

const PostSchemas = new ObjectType({
  name: 'PostSchemas',
  interfaces: [PostInterface],
  fields: {
    _id: { type: new NonNull(ID) },
    message: { type: StringType },
    user: {
      type: UserInterface,
      resolve: post => UsersModel.findOne({ _id: post.user }),
    },
    totalLikes: {
      type: Int,
      resolve: post => post.likes.length,
    },
    totalComments: {
      type: Int,
      resolve: post => CommentsModel.count({
        post: post._id,
        reply: { $exists: false },
      }),
    },
    comments: {
      type: new List(CommentSchemas),
      args: {
        _id: { type: StringType },
        limit: { type: Int },
      },
      resolve: (post, { _id, limit = 2 }) => {
        const q = { post: post._id, reply: { $exists: false } };
        if (_id) {
          q._id = { $lt: _id };
        }
        return CommentsModel.find(q).sort({ createdAt: -1 }).limit(limit);
      },
    },
    isLiked: {
      type: BooleanType,
    },
    createdAt: {
      type: StringType,
    },
  },
});

export default PostSchemas;
