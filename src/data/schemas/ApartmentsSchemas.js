import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLNonNull as NonNull,
  GraphQLInt as Int,
} from 'graphql';

import BuildingSchemas from './BuildingSchemas';
import { BuildingsModel } from '../../data/models';

const ApartmentsSchemas = new ObjectType({
  name: 'ApartmentsSchemas',
  fields: {
    _id: { type: new NonNull(ID) },
    number: { type: Int },
    building: {
      type: BuildingSchemas,
      resolve: apartment => BuildingsModel.findOne({ _id: apartment.building }),
    },
  },
});

export default ApartmentsSchemas;
