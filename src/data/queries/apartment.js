import {
  GraphQLString as StringType,
} from 'graphql';

import ApartmentsSchemas from '../schemas/ApartmentsSchemas';
import { ApartmentsModel } from '../models';

const apartment = {
  type: ApartmentsSchemas,
  args: {
    _id: { type: StringType },
  },
  resolve: ({ request }, { _id }) => ApartmentsModel.findOne({ _id }),
};

export default apartment;
