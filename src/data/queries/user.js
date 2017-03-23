import {
  GraphQLString as StringType,
} from 'graphql';
import UserSchemas from '../schemas/UserSchemas';
import {
  UsersModel,
} from '../models';

const user = {
  type: UserSchemas,
  args: {
    _id: { type: StringType },
  },
  resolve({ request }, {_id}) {
    return UsersModel.findOne({_id});
  },
};

export default user;
