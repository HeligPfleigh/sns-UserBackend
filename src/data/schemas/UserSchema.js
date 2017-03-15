import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const UserSchemas = new GraphQLObjectType({
  name: 'UserSchema',
  description: 'UserInterface',
  fields: () => ({
    _id: {
      type: GraphQLString,
      // resolve: (user) => user._id,
    },
    username: {
      type: GraphQLString,
      // resolve: (user) => user._id,
    },
  }),
});

export default UserSchemas;
