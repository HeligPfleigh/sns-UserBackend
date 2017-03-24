import {
  GraphQLString as StringType,
} from 'graphql';

import UserSchemas from '../../schemas/UserSchemas';
import { UsersModel, FriendsRelationModel } from '../../models';

const removeFriend = {
  type: UserSchemas,
  args: {
    _id: { type: StringType },
  },
  resolve: ({ request }, { _id }) => {
    const result = new Promise(async (resolve, reject) => {
      try {
        await FriendsRelationModel.remove({
          user: request.user.id,
          friend: _id,
        });
        resolve(UsersModel.findOne({ _id }));
      } catch (e) {
        reject(e);
      }
    });

    return result;
  },
};

export default removeFriend;
