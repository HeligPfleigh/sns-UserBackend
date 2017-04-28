import {
  GraphQLString as StringType,
  GraphQLInputObjectType as InputObjectType,
} from 'graphql';

import UserSchemas from '../../schemas/UserSchemas';
import { UsersModel } from '../../models';

const requestType = new InputObjectType({
  name: 'UpdateProfileInput',
  fields: {
    picture: {
      type: StringType,
    },
    firstName: {
      type: StringType,
    },
    lastName: {
      type: StringType,
    },
    gender: {
      type: StringType,
    },
  },
});

const updateProfile = {
  type: UserSchemas,
  args: {
    profile: { type: requestType },
  },
  resolve: ({ request }, { profile }) => {
    const _id = request.user.id;
    const result = new Promise(async (resolve, reject) => {
      try {
        const update = await UsersModel.update({ _id }, { $set: { profile } });
        if (update.nModified !== 0) {
          resolve(UsersModel.findOne({ _id }));
        } else {
          throw new Error("Can't updated");
        }
      } catch (e) {
        reject(e);
      }
    });
    return result;
  },
};

export default updateProfile;
