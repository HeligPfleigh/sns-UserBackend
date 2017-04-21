import {
  GraphQLID as ID,
  GraphQLNonNull as NonNull,
  GraphQLString as StringType,
  GraphQLInterfaceType as Interface,
} from 'graphql';

import UserInterface from './UserInterface';
import PostInterface from './PostInterface';

const CommentInterface = new Interface({
  name: 'CommentInterface',
  description: 'CommentInterface',
  fields: {
    _id: { type: new NonNull(ID) },
    message: { type: StringType },
    post: {
      type: PostInterface,
    },
    user: {
      type: UserInterface,
    },
  },
  resolveType: () => 'CommentSchemas',
});

export default CommentInterface;
