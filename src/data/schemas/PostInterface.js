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
    title: {
      type: GraphQLString
    },
    done: {
      type: GraphQLBoolean
    }
  }),
  resolveType: (obj) => {
    return 'PostSchemas';
  }
});

export default PostInterface;
