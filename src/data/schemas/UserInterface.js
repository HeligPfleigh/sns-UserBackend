import {
  GraphQLString,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';

import ProfileSchemas from './ProfileSchemas';

const UserInterface = new GraphQLInterfaceType({
  name: 'UserInterface',
  description: 'UserInterface',
  fields: () => ({
    _id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    username: {
      type: GraphQLString
    },
    profile:{
      type: ProfileSchemas,
    },
  }),
  resolveType: (obj) => {
    return 'UserSchemas';
  }
});

export default UserInterface;
