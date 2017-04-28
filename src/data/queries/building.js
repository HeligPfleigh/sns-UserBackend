import {
  GraphQLString as StringType,
} from 'graphql';

import BuildingSchemas from '../schemas/BuildingSchemas';
import { BuildingsModel } from '../models';

const building = {
  type: BuildingSchemas,
  args: {
    _id: { type: StringType },
  },
  resolve: ({ request }, { _id }) => BuildingsModel.findOne({ _id }),
};

export default building;
