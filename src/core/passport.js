/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/**
 * Passport.js reference implementation.
 * The database schema used in this sample is available at
 * https://github.com/membership/membership.db/tree/master/postgres
 */

import passport from 'passport';
import moment from 'moment';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// import { User, UserLogin, UserClaim, UserProfile } from '../data/models';
import * as admin from 'firebase-admin';
import * as firebase from 'firebase';
import _ from 'lodash';
import config from '../config';
import {
  UsersModel,
  ApartmentsModel,
} from '../data/models';
import fetch from './fetch';
import chat from './chat';

export const defaultAdminApp = admin.initializeApp({
  credential: admin.credential.cert(config.auth.firebaseAdmin),
  databaseURL: config.auth.firebase.databaseURL,
});

async function getChatToken({ accessToken, chatId }) {
  let result = {};
  try {
    if (chatId) {
      result.token = await defaultAdminApp.auth().createCustomToken(chatId);
    } else {
      const credential = await firebase.auth.FacebookAuthProvider.credential(accessToken);
      const loginResult = await chat.service.auth().signInWithCredential(credential);
      const token = await defaultAdminApp.auth().createCustomToken(loginResult.uid);
      result = { chatId: loginResult.uid, token };
    }
  } catch (error) {
    console.error(error); // eslint-disable-line
    return null;
  }
  return result;
}
function createChatUserIfNotExits(user) {
  const refUser = defaultAdminApp.database().ref('users');
  if (user && user.chatId) {
    refUser.child(user.chatId).once('value', (snap) => {
      const userData = snap.val();
      if (!userData || !userData.uid) {
        refUser.child(user.chatId).set(Object.assign({ uid: user.chatId }, _.pick(user, ['id', 'username', 'profile'])));
      }
    });
  }
}

const { Types: { ObjectId } } = mongoose;

export async function verifiedChatToken(req, res) {
  try {
    const user = jwt.verify(req.cookies.id_token, config.auth.jwt.secret);
    if (user && user.chatToken && user.chatExp && moment(user.chatExp).diff(new Date()) < 0) {
      const chatToken = await defaultAdminApp.auth().createCustomToken(user.chatId);
      req.user = { ...user, chatToken, chatExp: moment().add(0, 'hours').unix() };
      const expiresIn = 60 * 60 * 24 * 180;
      const token = jwt.sign(_.omit(req.user, ['exp', 'iat']), config.auth.jwt.secret, { expiresIn });
      res.cookie('id_token', token, { maxAge: 1000 * expiresIn });
      return req.user;
    }
  } catch (error) {
    return error;
  }
  return null;
}

export async function getLongTermToken(accessToken) {
  const longlivedTokenRequest = await fetch(`https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${config.auth.facebook.id}&fb_exchange_token=${accessToken}&client_secret=${config.auth.facebook.secret}`);
  const longlivedTokenObject = JSON.parse(await longlivedTokenRequest.text());
  // long-lived tokens will expire in about 60 days
  // so we want to refresh it every 50 days

  return {
    tokenExpire: moment().add(50, 'days').toDate(),
    accessToken: longlivedTokenObject.access_token,
  };
}
/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy({
  clientID: config.auth.facebook.id,
  clientSecret: config.auth.facebook.secret,
  callbackURL: config.auth.facebook.callBackURL,
  profileFields: ['name', 'email', 'link', 'locale', 'timezone', 'gender'],
  passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => {
  /* eslint-disable no-underscore-dangle */
  // const loginName = 'facebook';
  // const claimType = 'urn:facebook:access_token';
  const fooBar = async () => {
    const longlivedToken = await getLongTermToken(accessToken);
    let user = await UsersModel.findOne({
      'emails.address': profile._json.email,
    });
    let chatToken;
    if (!user) {
      chatToken = await getChatToken({ accessToken });
      user = await UsersModel.create({
        emails: {
          address: profile._json.email,
          verified: true,
        },
        username: profile._json.email.replace(/@.*$/, ''),
        profile: {
          gender: profile._json.gender,
          lastName: profile._json.last_name,
          firstName: profile._json.first_name,
          picture: `https://graph.facebook.com/${profile.id}/picture?type=large`,
        },
        building: ObjectId('58da279f0ff5af8c8be59c36'),
        roles: ['user'],
        services: {
          facebook: longlivedToken,
        },
        chatId: chatToken && chatToken.chatId,
      });
      ApartmentsModel.create({
        number: '27',
        building: ObjectId('58da279f0ff5af8c8be59c36'),
        user: user._id,
        isOwner: true,
      });
    } else if (!(user && user.chatId)) {
      chatToken = await getChatToken({ accessToken });
      await UsersModel.update({
        _id: user._id,
      }, {
        $set: {
          chatId: chatToken && chatToken.chatId,
        },
      });
    } else {
      chatToken = await getChatToken({ chatId: user && user.chatId });
    }
    createChatUserIfNotExits(user);
    done(null, {
      id: user._id,
      profile: user.profile,
      email: user.emails.address,
      roles: user.roles,
      chatToken: chatToken && chatToken.token,
      chatExp: moment().add(1, 'hours').unix(),
      chatId: user && user.chatId,
    });
  };

  fooBar().catch(done);
}));

export default passport;
