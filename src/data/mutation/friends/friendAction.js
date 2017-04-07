import {
  GraphQLString as StringType,
} from 'graphql';

import UserSchemas from '../../schemas/UserSchemas';
import { UsersModel, FriendsRelationModel } from '../../models';
import { PENDING, ACCEPTED, REJECTED } from '../../../constants';

const acceptFriend = {
  type: UserSchemas,
  args: {
    userId: { type: StringType },
    cmd: { type: StringType },
  },
  resolve: ({ request }, { userId, cmd }) => new Promise(async (resolve, reject) => {
    try {
      if (cmd === PENDING) {
        await FriendsRelationModel.update({
          user: request.user.id,
          friend: userId,
        }, { $set: {
          status: cmd,
          isSubscribe: true,
        } }, { upsert: true });
      }
      if (cmd === REJECTED) {
        await FriendsRelationModel.update({
          user: userId,
          friend: request.user.id,
        }, { $set: {
          status: cmd,
          isSubscribe: true,
        } }, { upsert: true });
      }
      if (cmd === ACCEPTED) {
        await FriendsRelationModel.update({
          user: request.user.id,
          friend: userId,
        }, { $set: {
          status: cmd,
          isSubscribe: true,
        } }, { upsert: true });
        await FriendsRelationModel.update({
          user: userId,
          friend: request.user.id,
        }, { $set: {
          status: cmd,
          isSubscribe: true,
        } }, { upsert: true });
      }
      resolve(UsersModel.findOne({ _id: userId }));
    } catch (e) {
      reject(e);
    }
  }),
};

export default acceptFriend;
