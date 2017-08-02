import isUndefined from 'lodash/isUndefined';
import isEmpty from 'lodash/isEmpty';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { generate as idRandom } from 'shortid';
import moment from 'moment';
import {
  UsersModel,
  FriendsRelationModel,
} from '../models';
import { getChatToken, createChatUserIfNotExits } from '../../core/passport';
import {
  sendAcceptFriendNotification,
  sendFriendRequestNotification,
} from '../../utils/notifications';
import { generateSearchField } from '../../utils/removeToneVN';
import Mailer from '../../core/mailer';
import config from '../../config';

function getUser(userId) {
  return UsersModel.findOne({ _id: userId });
}

async function checkExistUser(username) {
  const options = {
    $or: [
      { username },
      { 'phone.number': username },
      { 'emails.address': username },
    ],
  };
  const user = await UsersModel.findOne(options);
  if (isEmpty(user)) {
    return false;
  }
  return true;
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

  params.password = bcrypt.hashSync(password, bcrypt.genSaltSync(), null);

  // Connect user with account firebase
  const chatToken = await getChatToken({ email: emailAddress, password });
  const activeCode = idRandom();

  params.profile.picture = '/avarta-default.jpg';
  const user = {
    ...params,
    chatId: chatToken && chatToken.chatId,
    activeCode,
  };
  user.search = generateSearchField(user);

  createChatUserIfNotExits(user);
  // NOTE: update search here

  const result = await UsersModel.create(user);
  if (result) {
    const mailObject = {
      to: emailAddress,
      subject: 'SNS-SERVICE: Kích hoạt tài khoản',
      template: 'registration',
      lang: 'vi-vn',
      data: {
        username,
        email: emailAddress,
        activeCode,
        host: config.client,
      },
    };

    await Mailer.sendMail(mailObject);
  }

  return result;
}

async function activeUser(params) {
  const {
    username,
    activeCode,
  } = params;

  if (isUndefined(username)) {
    throw new Error('username is undefined');
  }

  if (isUndefined(activeCode)) {
    throw new Error('code active is undefined');
  }

  if (!await UsersModel.findOne({ username })) {
    throw new Error('Account is not exist');
  }

  const user = await UsersModel.findOne({ username, activeCode });
  if (!user || isEmpty(user)) {
    throw new Error('Code active incorrect');
  }

  const updatedAt = moment(user.updatedAt);
  const duration = moment.duration(moment().diff(updatedAt));
  const hours = duration.asHours();

  if (hours > 24) {
    throw new Error('Code active expired');
  }


  const result = await UsersModel.findOneAndUpdate({ _id: user._id }, {
    $set: {
      isActive: 1,
      activeCode: '',
      'emails.verified': true,
    },
  });
  if (result) {
    const mailObject = {
      to: result.emails.address,
      subject: 'SNS-SERVICE: Kích hoạt tài khoản thành công',
      template: 'activated',
      lang: 'vi-vn',
      data: {
        username,
        host: config.client,
      },
    };

    await Mailer.sendMail(mailObject);
  }

  return result;
}

export default {
  checkExistUser,
  createUser,
  activeUser,
  getUser,
  acceptFriend,
  rejectFriend,
  sendFriendRequest,
  updateProfile,
};
