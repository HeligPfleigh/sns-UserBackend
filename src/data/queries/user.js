import {
  GraphQLList,
} from 'graphql';

import UserSchemas from '../schemas/UserSchema';
import User from '../models';

const users = {
  type: new GraphQLList(UserSchemas),
  resolve() {
    return User.find({});
  },
};

export default users;
