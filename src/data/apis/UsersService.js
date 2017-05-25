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

async function rejectFriend(userId, friendId) {
  if (!await FriendsRelationModel.findOne({
    user: userId,
    friend: friendId,
    status: 'PENDING',
  })) {
    throw new Error('not found friend request');
  }

  await FriendsRelationModel.update({
    user: userId,
    friend: friendId,
    status: 'REJECTED',
  });
  return UsersModel.findOne({ _id: friendId });
}

async function sendFriendRequest(userId, friendId) {
  await FriendsRelationModel.create({
    user: userId,
    friend: friendId,
    status: 'PENDING',
  });
  return UsersModel.findOne({ _id: friendId });
}

export default {
  getUser,
  acceptFriend,
  rejectFriend,
  sendFriendRequest,
};
