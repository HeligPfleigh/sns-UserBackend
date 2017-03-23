import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const ProfileSchemas = new GraphQLObjectType({
  name: 'ProfileSchemas',
  description: 'ProfileSchemas',
  fields: () => ({
    picture: {
      type: GraphQLString,
    },
    firstName: {
      type: GraphQLString,
    },
    lastName: {
      type: GraphQLString,
    },
    gender: {
      type: GraphQLString,
    }
  })
});

export default ProfileSchemas;
