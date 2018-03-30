import isUndefined from 'lodash/isUndefined';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { generate as idRandom } from 'shortid';
import moment from 'moment';
import uniqWith from 'lodash/uniqWith';
import axios from 'axios';
import {
  UsersModel,
  FriendsRelationModel,
  BuildingMembersModel,
  BuildingsModel,
  NotificationsModel,
  ApartmentsModel,
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

async function login({ account, password }) {
  try {
    if (!account || !password) {
      throw new Error('Lỗi thiếu tham số');
    }

    const user = await UsersModel.findOne({
      $or: [
        { username: account.toLowerCase() },
        { 'email.address': account.toLowerCase() },
      ],
    });

    if (!user) {
      throw new Error('Tài khoản không tồn tại');
    }

    if (!await bcrypt.compare(password, user.password.value)) {
      throw new Error('Mật khẩu hiện tại không đúng');
    }

    return {
      id_token: await user.createToken(),
    };
  } catch (error) {
    throw error;
  }
}

async function loginWithFacebook({ token }) {
  try {
    if (!token) {
      throw new Error('Lỗi thiếu tham số');
    }

    const { data } = await axios.get(
      `https://graph.facebook.com/me?fields=email&access_token=${token}`,
    );

    if (!data || !data.email) {
      throw new Error('Không thể lấy dữ liệu từ fb');
    }

    const user = await UsersModel.findOne({
      'email.address': data.email,
    });

    if (!user) {
      throw new Error('Tài khoản không tồn tại');
    }

    return {
      id_token: await user.createToken(),
    };
  } catch (error) {
    throw error;
  }
}

async function getUser(userId) {
  const user = await UsersModel.findOne({ _id: userId });
  if (!user) {
    throw new Error('not found user request');
  }
  return user;
}

async function checkExistUser({ userId, query }) {
  // Case 1: Only check exist user by key
  // -> use verify user with key
  if (userId && !query) {
    try {
      const user = await UsersModel.findById(userId);
      if (isEmpty(user)) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  // Case 2: Check exist user by username
  // -> use create new or update
  const options = {
    $or: [
      { username: query },
      { 'phone.number': query },
      { 'email.address': query },
    ],
  };

  const user = await UsersModel.findOne(options);
  if (
    (isEmpty(user)) ||
    (userId && isEqual(userId, user._id.toString()))
  ) {
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
  }, {
    $set: {
      status: ACCEPTED,
      isSubscribe: true,
    },
  }, { upsert: true });
  await FriendsRelationModel.update({
    user: friendId,
    friend: userId,
  }, {
    $set: {
      status: ACCEPTED,
      isSubscribe: true,
    },
  }, { upsert: true });
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
  }, {
    $set: {
      status: REJECTED,
      isSubscribe: false,
    },
  }, { upsert: true });
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
    updatedAt: new Date(),
  };

  params.password.value = await bcrypt.hashSync(password.value, bcrypt.genSaltSync(), null);

  // Connect user with account firebase
  const chatToken = await getChatToken({ email: emailAddress, password });
  const activeCode = idRandom();

  params.profile.picture = params.profile.picture || '/avatar-default.jpg';
  params.email.code = activeCode;

  const { apartments, services, ...userObj } = params;
  const data = {
    ...userObj,
    building,
    chatId: chatToken && chatToken.chatId,
    services: services && JSON.parse(services),
  };
  data.search = generateUserSearchField(data);

  createChatUserIfNotExits(data);

  const user = await UsersModel.create(data);

  return {
    user,
    activeCode,
  };
}

async function sendActivationEmail({ emailAddress, username, activeCode }) {
  await Mailer.sendMail({
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
  });
}

async function createNewRequestJoinBuilding({ user, building, apartments }) {
  const r = await BuildingMembersModel.create({
    user,
    building,
    status: PENDING,
    type: MEMBER,
    requestInformation: {
      apartments,
    },
  });

  return r;
}

async function newRegisteredUser(params) {
  const { user, activeCode } = await createUser(params);
  let requestJoinBuilding;
  if (user) {
    const {
      username,
      email: {
        address: emailAddress,
      },
      building,
    } = params;

    // create new a request register approve to building
    requestJoinBuilding = await createNewRequestJoinBuilding({
      user: user._id,
      building,
      apartments: params.apartments,
    });

    await sendActivationEmail({
      emailAddress,
      username,
      activeCode,
    });
  }

  return {
    user,
    requestJoinBuilding,
  };
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

  const updatedAt = moment(user.email.updatedAt || new Date());
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
      subject: 'SNS-SERVICE: Kích hoạt email tài khoản thành công',
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

async function addNewResident(params) {
  const { user, requestJoinBuilding } = await newRegisteredUser(params);

  if (requestJoinBuilding) {
    await BuildingMembersModel.update({
      _id: requestJoinBuilding._id,
    }, {
      $set: {
        status: ACCEPTED,
      },
    });
    const { requestInformation } = requestJoinBuilding;
    await (requestInformation.apartments || []).map(async (apartmentId) => {
      const doc = await ApartmentsModel.findById(apartmentId);
      if (doc) {
        // if the first user register into apartment
        doc.owner = doc.owner || user._id;

        // and push new user into array value users field
        (doc.users || []).push(user._id);
        doc.users = uniqWith((doc.users || []), isEqual);

        // Save update object
        await doc.save();
      }
    });

    await UsersModel.findByIdAndUpdate(user._id, { status: 1 });
  }

  return {
    user,
  };
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
        'password.code': activeCode,
        'password.counter': 0,
        'password.updatedAt': new Date(),
      },
    });

    if (result) {
      await Mailer.sendMail({
        to: email,
        subject: 'SNS-SERVICE: Thông báo khôi phục mật khẩu',
        template: 'forgot_password',
        lang: 'vi-vn',
        data: {
          email,
          activeCode,
          username: result.username,
          host: config.client,
        },
      });
    }

    return true;
  } catch (error) {
    return false;
  }
}

async function changePassword({ username, password, oldPassword }) {
  if (isUndefined(username)) {
    throw new Error('Bạn chưa cung cấp tên đăng nhập');
  }

  if (isUndefined(password)) {
    throw new Error('Bạn chưa cung cấp mật khẩu mới');
  }

  const user = await UsersModel.findOne({ username });
  if (isEmpty(user)) {
    throw new Error('Tài khoản không tồn tại');
  }

  if (!isEmpty(oldPassword)) {
    const validPassword = await bcrypt.compare(oldPassword, user.password.value);
    if (!validPassword) {
      throw new Error('Mật khẩu hiện tại không đúng');
    }
  }

  const passwordVal = await bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
  const result = await UsersModel.findOneAndUpdate({ username }, {
    $set: {
      'password.code': '',
      'password.counter': 0,
      'password.value': passwordVal,
      'password.updatedAt': new Date(),
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

async function updateUserProfile({ userId, userData }) {
  if (isEmpty(userId) || isEmpty(userData)) {
    throw new Error('Lỗi thiếu tham số');
  }

  const user = await UsersModel.findById(userId);
  if (!user) {
    throw new Error('Thông tin người dùng không tồn tại');
  }

  const { email, phone, profile } = user;
  const data = {
    email,
    phone,
    profile,
  };

  let isChangeEmail = false;
  if (!isEqual(email && email.address, userData.email.address)) {
    data.email = {
      address: userData.email.address,
      verified: false,
      code: idRandom(),
      updatedAt: new Date(),
    };
    isChangeEmail = true;
  }

  // let isChangePhone = false;
  if (!isEqual(phone && phone.number, userData.phone.number)) {
    data.phone = {
      number: userData.phone.number,
      verified: false,
      code: idRandom(),
      updatedAt: new Date(),
    };
    // isChangePhone = true;
  }

  data.profile = {
    ...data.profile,
    ...userData.profile,
  };

  await UsersModel.update({ _id: userId }, { $set: data });

  const result = await UsersModel.findById(userId);

  if (isChangeEmail) {
    await sendActivationEmail({
      emailAddress: result.email.address,
      username: result.username,
      activeCode: result.email.code,
    });
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
  login,
  loginWithFacebook,
  checkExistUser,
  newRegisteredUser,
  addNewResident,
  activeUser,
  getUser,
  acceptFriend,
  rejectFriend,
  sendFriendRequest,
  updateProfile,
  forgotPassword,
  changePassword,
  updateUserProfile,
  codePasswordValidator,
  cancelFriendRequested,
  sendUnfriendRequest,
};
