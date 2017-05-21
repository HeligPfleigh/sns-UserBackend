import {
  UsersModel,
  FriendsRelationModel,
} from '../models';

function getUser(userId) {
  return UsersModel.findOne({ _id: userId });
}

async function acceptFriend(userId, friendId) {
  await FriendsRelationModel.update({
    user: userId,
    friend: friendId,
  }, { $set: {
    status: 'ACCEPTED',
    isSubscribe: true,
  } }, { upsert: true });
  await FriendsRelationModel.update({
    user: friendId,
    friend: userId,
  }, { $set: {
    status: 'ACCEPTED',
    isSubscribe: true,
  } }, { upsert: true });
  return UsersModel.findOne({ _id: friendId });
}

export default {
  getUser,
  acceptFriend,
};
