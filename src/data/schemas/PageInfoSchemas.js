import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
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
