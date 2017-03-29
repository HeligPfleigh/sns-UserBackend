import {
  GraphQLString as StringType,
} from 'graphql';

import UserSchemas from '../../schemas/UserSchemas';
import { UsersModel, FriendsRelationModel } from '../../models';

const sendFriendRequest = {
  type: UserSchemas,
  args: {
    _id: { type: StringType },
  },
  resolve: ({ request }, { _id }) => {
    const result = new Promise(async (resolve, reject) => {
      try {
        await FriendsRelationModel.create({
          user: request.user.id,
          friend: _id,
          status: 'PENDING',
          isSubscribe: true,
        });
        resolve(UsersModel.findOne({ _id }));
      } catch (e) {
        reject(e);
      }
    });
    return result;
  },
};

export default sendFriendRequest;
