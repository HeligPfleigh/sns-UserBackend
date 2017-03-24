import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLBoolean as Boolean,
} from 'graphql';

const PageInfoSchemas = new ObjectType({
  name: 'PageInfoSchemas',
  fields: {
    endCursor: { type: StringType },
    hasNextPage: { type: Boolean },
  },
});

export default PageInfoSchemas;
