import {
  GraphQLObjectType as ObjectType,
  // GraphQLID as ID,
  // GraphQLString as StringType,
  // GraphQLNonNull as NonNull,
  // GraphQLBoolean as Boolean,
  GraphQLList,
} from 'graphql';

import PageInfoSchemas from './PageInfoSchemas';
import PostSchemas from './PostSchemas';

const FeedsResultItemConnectionSchemas = new ObjectType({
  name: 'FeedsResultItemConnectionSchemas',
  fields: {
    pageInfo: {
      type: PageInfoSchemas,
    },
    edges: {
      type: new GraphQLList(PostSchemas),
    },
  },
});

export default FeedsResultItemConnectionSchemas;
