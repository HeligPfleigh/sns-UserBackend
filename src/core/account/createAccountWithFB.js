import mongoose from 'mongoose';
import moment from 'moment';
import config from '../../config';
import fetch from '../fetch';
import {
  UsersModel,
  ApartmentsModel,
  BuildingMembersModel,
} from '../../data/models';
import { ACCEPTED, MEMBER } from '../../constants';

const { Types: { ObjectId } } = mongoose;
const building = ObjectId('58da279f0ff5af8c8be59c36');
const TOKEN_EXPIRE_DAY = 50;
const user = {
  roles: ['user'],
  building,
};

export async function getLongTermToken(accessToken) {
  const longlivedTokenRequest = await fetch(`https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${config.auth.facebook.id}&fb_exchange_token=${accessToken}&client_secret=${config.auth.facebook.secret}`);
  const longlivedTokenObject = JSON.parse(await longlivedTokenRequest.text());
  // long-lived tokens will expire in about 60 days
  // so we want to refresh it every 50 days
  return {
    tokenExpire: moment().add(TOKEN_EXPIRE_DAY, 'days').toDate(),
    accessToken: longlivedTokenObject.access_token,
  };
}

export default async function (accessToken, profile, chatToken) {
  if (!accessToken) {
    throw new Error('missing fb access token');
  }
  const u = Object.assign({}, user);
  if (chatToken) {
    u.chatId = chatToken.chatId;
  }
  const longlivedToken = await getLongTermToken(accessToken);
  u.services = {
    facebook: longlivedToken,
  };
  // username
  if (profile && profile._json && profile._json.email) {
    u.username = profile._json.email.replace(/@.*$/, '');
  } else if (profile && profile._json && profile._json.last_name && profile._json.first_name) {
    u.username = `${profile._json.last_name}_${profile._json.first_name}`;
  } else if (profile.displayName) {
    u.username = profile.displayName.replace(/\s/g, '');
  }
  // email
  if (profile && profile._json && profile._json.email) {
    u.emails = {
      address: profile._json.email,
      verified: true,
    };
  }
  u.profile = {
    gender: profile._json.gender,
    lastName: profile._json.last_name,
    firstName: profile._json.first_name,
    picture: `https://graph.facebook.com/${profile.id}/picture?type=large`,
  };
  const data = await UsersModel.create(u);
  ApartmentsModel.create({
    number: '27',
    building,
    user: data._id,
    isOwner: true,
  });
  BuildingMembersModel.create({
    user: data.id,
    building,
    status: ACCEPTED,
    type: MEMBER,
  });

  return data;
}
