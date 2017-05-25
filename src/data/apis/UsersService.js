import isUndefined from 'lodash/isUndefined';
import { ObjectId } from 'mongodb';
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
  if (isUndefined(userId)) {
    throw new Error('userId is undefined');
  }
  if (isUndefined(friendId)) {
    throw new Error('friendId is undefined');
  }
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
  if (isUndefined(userId)) {
    throw new Error('userId is undefined');
  }
  if (isUndefined(friendId)) {
    throw new Error('Argument passed in must be a single String of 12 bytes or a string of 24 hex characters');
  }

  if (!await UsersModel.findOne({ _id: new ObjectId(userId) })) {
    throw new Error('userId does not exist');
  }
  if (!await UsersModel.findOne({ _id: new ObjectId(friendId) })) {
    throw new Error('friendId does not exist');
  }
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
