import { GraphQLList } from 'graphql';

import UserSchemas from '../schemas/UserSchemas';
import { UsersModel } from '../models';

// console.warn('implement paging users');

const users = {
  type: new GraphQLList(UserSchemas),
  resolve({ request }) {
    return UsersModel.find(request._id ? { _id: request._id } : {});
  },
};

export default users;
