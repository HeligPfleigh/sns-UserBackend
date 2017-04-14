import {
  GraphQLString as StringType,
} from 'graphql';

import UserSchemas from '../../schemas/UserSchemas';
import { UsersModel, FriendsRelationModel } from '../../models';

const acceptFriend = {
  type: UserSchemas,
  args: {
    userId: { type: StringType },
  },
  resolve: ({ request }, { userId }) => new Promise(async (resolve, reject) => {
    try {
      await FriendsRelationModel.update({
        user: request.user.id,
        friend: userId,
      }, { $set: {
        status: 'ACCEPTED',
        isSubscribe: true,
      } }, { upsert: true });
      await FriendsRelationModel.update({
        user: userId,
        friend: request.user.id,
      }, { $set: {
        status: 'ACCEPTED',
        isSubscribe: true,
      } }, { upsert: true });
      resolve(UsersModel.findOne({ _id: userId }));
    } catch (e) {
      reject(e);
    }
  }),
};

export default acceptFriend;