import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLInt as Int,
  GraphQLBoolean as BooleanType,
} from 'graphql';

import UserInterface from './UserInterface';
import PostInterface from './PostInterface';

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
      }),
    },
    isLiked: {
      type: BooleanType,
    },
  },
});

export default PostSchemas;
