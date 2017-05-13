import {
  GraphQLObjectType as ObjectType,
  GraphQLList,
} from 'graphql';

import PageInfoSchemas from './PageInfoSchemas';
import NotificationSchemas from './NotificationSchemas';

const NotificationsResultSchemas = new ObjectType({
  name: 'NotificationsResultSchemas',
  fields: {
    pageInfo: {
      type: PageInfoSchemas,
    },
    edges: {
      type: new GraphQLList(NotificationSchemas),
    },
  },
});

export default NotificationsResultSchemas;
