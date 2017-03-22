import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as Boolean,
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
    title: { type: StringType },
    done: { type: Boolean },
    owner: {
      type: UserInterface,
      resolve: (todo) => UsersModel().findOne({_id: todo.owner}),
    }
  },
});

export default PostSchemas;
