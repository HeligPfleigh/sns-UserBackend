import {
  // GraphQLObjectType as ObjectType,
  // GraphQLString,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

const NotificationInterface = new GraphQLInterfaceType({
  name: 'NotificationInterface',
  description: 'NotificationInterface',
  fields: () => ({
    _id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    // user: {
    //   type: ObjectType,
    // },
    // subject: {
    //   type: ObjectType,
    // },
  }),
  resolveType: () => 'NotificationSchemas',
});

export default NotificationInterface;
