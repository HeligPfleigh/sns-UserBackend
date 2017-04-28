import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';

const BuildingSchemas = new ObjectType({
  name: 'BuildingSchemas',
  fields: {
    _id: { type: new NonNull(ID) },
    name: { type: StringType },
  },
});

export default BuildingSchemas;
