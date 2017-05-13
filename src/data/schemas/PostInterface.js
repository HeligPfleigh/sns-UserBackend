import {
  GraphQLString,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

import UserInterface from './UserInterface';

const PostInterface = new GraphQLInterfaceType({
  name: 'PostInterface',
  description: 'PostInterface',
  fields: () => ({
    _id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    message: {
      type: GraphQLString,
    },
    user: {
      type: UserInterface,
    },
  }),
  resolveType: () => {
    const result = 'PostSchemas';
    return result;
  },
});

export default PostInterface;
