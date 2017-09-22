import isUndefined from 'lodash/isUndefined';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { generate as idRandom } from 'shortid';
import moment from 'moment';
import {
  UsersModel,
  FriendsRelationModel,
  BuildingMembersModel,
  BuildingsModel,
  NotificationsModel,
} from '../models';
import { MEMBER, PENDING, ACCEPTED, REJECTED, FRIEND_REQUEST } from '../../constants';
import { getChatToken, createChatUserIfNotExits } from '../../core/passport';
import {
  sendAcceptFriendNotification,
  sendFriendRequestNotification,
} from '../../utils/notifications';
import { generateUserSearchField } from '../../utils/removeToneVN';
import Mailer from '../../core/mailer';
import config from '../../config';

async function getUser(userId) {
  const user = await UsersModel.findOne({ _id: userId });
  if (!user) {
    throw new Error('not found user request');
  }
  return user;
}

async function checkExistUser(username) {
  const options = {
    $or: [
      { username },
      { 'phone.number': username },
      { 'email.address': username },
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
    status: PENDING,
  })) {
    throw new Error('not found friend request');
  }
  await FriendsRelationModel.update({
    user: userId,
    friend: friendId,
  }, { $set: {
    status: ACCEPTED,
    isSubscribe: true,
  } }, { upsert: true });
  await FriendsRelationModel.update({
    user: friendId,
    friend: userId,
  }, { $set: {
    status: ACCEPTED,
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
    status: PENDING,
  })) {
    throw new Error('not found friend request');
  }

  await FriendsRelationModel.update({
    user: friendId,
    friend: userId,
    status: PENDING,
  }, { $set: {
    status: REJECTED,
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
    status: PENDING,
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
    email: {
      address: emailAddress,
    },
    building,
  } = params;
  // const building = ObjectId('58da279f0ff5af8c8be59c36');

  if (isUndefined(password)) {
    throw new Error('password is undefined');
  }

  if (isUndefined(username)) {
    throw new Error('username is undefined');
  }

  if (isUndefined(emailAddress)) {
    throw new Error('email is undefined');
  }

  if (isUndefined(building)) {
    throw new Error('building is undefined');
  }

  if (!await BuildingsModel.findOne({ _id: building })) {
    throw new Error('building is not exist');
  }

  if (await UsersModel.findOne({ username })) {
    throw new Error('username is exist');
  }

  if (await UsersModel.findOne({ 'phone.number': phoneNumber })) {
    throw new Error('Phone number is exist');
  }

  if (await UsersModel.findOne({ 'email.address': emailAddress })) {
    throw new Error('Email address is exist');
  }

  params.password = {
    value: '',
    counter: 0,
    code: '',
    updateAt: new Date(),
  };

  params.password.value = await bcrypt.hashSync(password.value, bcrypt.genSaltSync(), null);

  // Connect user with account firebase
  const chatToken = await getChatToken({ email: emailAddress, password });
  const activeCode = idRandom();

  params.profile.picture = params.profile.picture || '/avatar-default.jpg';
  params.email.code = activeCode;

  const { apartments, services, ...userObj } = params;
  const user = {
    ...userObj,
    building,
    chatId: chatToken && chatToken.chatId,
    services: services && JSON.parse(services),
  };
  user.search = generateUserSearchField(user);

  createChatUserIfNotExits(user);
  // NOTE: update search here

  const result = await UsersModel.create(user);
  if (result) {
    // create new a request register approve to building
    await BuildingMembersModel.create({
      user: result._id,
      building,
      status: PENDING,
      type: MEMBER,
      requestInformation: {
        apartments,
      },
    });

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

  const user = await UsersModel.findOne({ username, 'email.code': activeCode });
  if (!user || isEmpty(user)) {
    throw new Error('Code active incorrect');
  }

  const updatedAt = moment(user.mail.updatedAt || new Date());
  const duration = moment.duration(moment().diff(updatedAt));
  const hours = duration.asHours();

  if (hours > 24) {
    throw new Error('Code active expired');
  }

  const result = await UsersModel.findOneAndUpdate({ _id: user._id }, {
    $set: {
      // status: 1,
      'email.code': '',
      'email.verified': true,
    },
  });

  if (result) {
    const mailObject = {
      to: result.email.address,
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

async function forgotPassword(email) {
  try {
    if (isUndefined(email)) {
      throw new Error('email is undefined');
    }

    const user = await UsersModel.findOne({ 'email.address': email });
    if (!user) {
      throw new Error('Account is not exist');
    }

    const activeCode = idRandom();

    const result = await UsersModel.findOneAndUpdate({ _id: user._id }, {
      $set: {
        // status: 1,
        'password.code': activeCode,
        'password.counter': 0,
        'password.updateAt': new Date(),
      },
    });

    if (result) {
      const mailObject = {
        to: email,
        subject: 'SNS-SERVICE: Khôi phục mật khẩu',
        template: 'forgot_password',
        lang: 'vi-vn',
        data: {
          email,
          activeCode,
          username: result.username,
          host: config.client,
        },
      };

      await Mailer.sendMail(mailObject);
    }

    return true;
  } catch (error) {
    return false;
  }
}

async function changePassword({ username, password }) {
  if (isUndefined(username)) {
    throw new Error('username is undefined');
  }

  if (isUndefined(password)) {
    throw new Error('password is undefined');
  }

  if (!await UsersModel.findOne({ username })) {
    throw new Error('Account is not exist');
  }

  const passwordVal = await bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
  const result = await UsersModel.findOneAndUpdate({ username }, {
    $set: {
      // status: 1,
      'password.code': '',
      'password.counter': 0,
      'password.value': passwordVal,
      'password.updateAt': new Date(),
    },
  });

  if (result) {
    const mailObject = {
      to: result.email.address,
      subject: 'SNS-SERVICE: Đổi mật khẩu tài khoản thành công',
      template: 'change_password',
      lang: 'vi-vn',
      data: {
        username: result.username,
        host: config.client,
      },
    };

    await Mailer.sendMail(mailObject);
  }

  return result;
}

async function codePasswordValidator({ username, code }) {
  // eslint-disable-next-line
  if (isEmpty(username)) {
    throw new Error('Bạn chưa cung cấp tên đăng nhập');
  }

  if (isEmpty(code)) {
    throw new Error('Bạn chưa cung cấp mã');
  }

  const user = await UsersModel.findOne({ username });
  if (!user || isEmpty(user)) {
    throw new Error('Tên đăng nhập không đúng');
  }

  if (!user.password.code || (!isEqual(user.password.code, code))) {
    throw new Error('Mã kích hoạt không đúng');
  }

  const updatedAt = moment(user.password.updatedAt || new Date());
  const duration = moment.duration(moment().diff(updatedAt));
  const hours = duration.asHours();

  if (hours > 24) {
    throw new Error('Mã kích hoạt đã hết hạn');
  }

  return true;
}

async function cancelFriendRequested(userId, friendId) {
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
  await FriendsRelationModel.remove({
    user: userId,
    friend: friendId,
    status: PENDING,
    isSubscribe: true,
  });
  await NotificationsModel.remove({
    user: friendId,
    actors: [userId],
    type: FRIEND_REQUEST,
  });
  return UsersModel.findOne({ _id: friendId });
}

async function sendUnfriendRequest(userId, friendId) {
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
  await FriendsRelationModel.remove({
    $or: [
      {
        user: userId,
        friend: friendId,
      },
      {
        user: friendId,
        friend: userId,
      },
    ],
    status: ACCEPTED,
    isSubscribe: true,
  });
  return UsersModel.findOne({ _id: friendId });
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
  forgotPassword,
  changePassword,
  codePasswordValidator,
  cancelFriendRequested,
  sendUnfriendRequest,
};
