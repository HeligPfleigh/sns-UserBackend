import UserSchemas from '../schemas/UserSchemas';
import {
  UsersModel,
} from '../models';

const me = {
  type: UserSchemas,
  resolve: ({ request }) => UsersModel.findOne({ _id: request.user.id }),
};

export default me;
