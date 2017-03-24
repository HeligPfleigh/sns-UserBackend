import {
  GraphQLString,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

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
  }),
  resolveType: () => {
    const result = 'PostSchemas';
    return result;
  },
});

export default PostInterface;
