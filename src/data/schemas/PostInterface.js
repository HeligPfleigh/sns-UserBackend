import {
  GraphQLString,
  GraphQLBoolean,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';

const PostInterface = new GraphQLInterfaceType({
  name: 'PostInterface',
  description: 'PostInterface',
  fields: () => ({
    _id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    message: {
      type: GraphQLString
    },
  }),
  resolveType: (obj) => {
    return 'PostSchemas';
  }
});

export default PostInterface;
