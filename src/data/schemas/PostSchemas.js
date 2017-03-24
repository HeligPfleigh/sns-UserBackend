import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';

import UserInterface from './UserInterface';
import PostInterface from './PostInterface';

import {
  UsersModel,
} from '../models';

const PostSchemas = new ObjectType({
  name: 'PostSchemas',
  interfaces: [PostInterface],
  fields: {
    _id: { type: new NonNull(ID) },
    message: { type: StringType },
    user: {
      type: UserInterface,
      resolve: (post) => {
        UsersModel.findOne({ _id: post.user });
      },
    },
  },
});

export default PostSchemas;
