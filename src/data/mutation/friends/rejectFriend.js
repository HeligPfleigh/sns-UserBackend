import {
  GraphQLString as StringType,
} from 'graphql';

import UserSchemas from '../../schemas/UserSchemas';
import { UsersModel, FriendsRelationModel } from '../../models';

const rejectFriend = {
  type: UserSchemas,
  args: {
    userId: { type: StringType },
  },
  resolve: ({ request }, { userId }) => new Promise(async (resolve, reject) => {
    try {
      await FriendsRelationModel.update({
        user: request.user.id,
        friend: userId,
        status: 'REJECTED',
      });
      resolve(UsersModel.findOne({ _id: userId }));
    } catch (e) {
      reject(e);
    }
  }),
};

export default rejectFriend;
