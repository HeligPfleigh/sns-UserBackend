import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import queries from './queries';
import mutation from './mutation';

const schema = new Schema({
  query: new ObjectType({
    name: 'RootQuery',
    fields: queries,
  }),
  mutation: new ObjectType({
    name: 'RootMutation',
    fields: mutation,
  }),
});

export default schema;

