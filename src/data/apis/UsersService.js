import isUndefined from 'lodash/isUndefined';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import {
  UsersModel,
  FriendsRelationModel,
} from '../models';
import {
  sendAcceptFriendNotification,
  sendFriendRequestNotification,
} from '../../utils/notifications';

function getUser(userId) {
  return UsersModel.findOne({ _id: userId });
}

async function acceptFriend(userId, friendId) {
  if (isUndefined(userId)) {
    throw new Error('userId is undefined');
  }
  if (isUndefined(friendId)) {
    throw new Error('friendId is undefined');
  }
  if (!await FriendsRelationModel.findOne({
    user: friendId,
    friend: userId,
    status: 'PENDING',
  })) {
    throw new Error('not found friend request');
  }
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
  sendAcceptFriendNotification(userId, friendId);

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
    user: friendId,
    friend: userId,
    status: 'PENDING',
  })) {
    throw new Error('not found friend request');
  }

  await FriendsRelationModel.update({
    user: friendId,
    friend: userId,
    status: 'PENDING',
  }, { $set: {
    status: 'REJECTED',
    isSubscribe: false,
  } }, { upsert: true });
  return UsersModel.findOne({ _id: friendId });
}

async function sendFriendRequest(userId, friendId) {
  if (isUndefined(userId)) {
    throw new Error('userId is undefined');
  }
  if (isUndefined(friendId)) {
    throw new Error('friendId is undefined');
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
    isSubscribe: true,
  });

  sendFriendRequestNotification(userId, friendId);
  return UsersModel.findOne({ _id: friendId });
}

async function updateProfile(userId, profile) {
  if (isUndefined(userId)) {
    throw new Error('userId is undefined');
  }
  if (!await UsersModel.findOne({ _id: new ObjectId(userId) })) {
    throw new Error('userId does not exist');
  }
  if (isUndefined(profile)) {
    throw new Error('profile is undefined');
  }
  if (isUndefined(profile.gender)) {
    throw new Error('gender is undefined');
  }
  if (isUndefined(profile.picture)) {
    throw new Error('picture is undefined');
  }
  if (isUndefined(profile.firstName)) {
    throw new Error('firstName is undefined');
  }
  if (isUndefined(profile.lastName)) {
    throw new Error('lastName is undefined');
  }
  await UsersModel.update({ _id: userId }, { $set: { profile } });

  return UsersModel.findOne({ _id: userId });
}

async function createUser(params) {
  const {
    username,
    password,
    phone: {
      number: phoneNumber,
    },
    emails: {
      address: emailAddress,
    },
  } = params;

  if (isUndefined(password)) {
    throw new Error('password is undefined');
  }

  if (isUndefined(username)) {
    throw new Error('username is undefined');
  }

  if (isUndefined(emailAddress)) {
    throw new Error('email is undefined');
  }

  if (await UsersModel.findOne({ username })) {
    throw new Error('username is exist');
  }

  if (await UsersModel.findOne({ 'phone.number': phoneNumber })) {
    throw new Error('Phone number is exist');
  }

  if (await UsersModel.findOne({ 'emails.address': emailAddress })) {
    throw new Error('Email address is exist');
  }

  params.password = bcrypt.hashSync(params.password, bcrypt.genSaltSync(), null);
  const user = await UsersModel.create(params);
  return user;
}

export default {
  createUser,
  getUser,
  acceptFriend,
  rejectFriend,
  sendFriendRequest,
  updateProfile,
};
