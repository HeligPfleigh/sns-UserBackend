import moment from 'moment';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { Strategy as LocalStrategy } from 'passport-local';
import FacebookTokenStrategy from 'passport-facebook-token';
import * as admin from 'firebase-admin';
import * as firebase from 'firebase';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import config from '../config';
import createAccountWithFB from './account/createAccountWithFB';
import {
  UsersModel,
  BuildingMembersModel,
} from '../data/models';
import chat from './chat';
import { generateToken, EXPIRES_IN } from '../utils/token';
import removeToneVN from '../utils/removeToneVN';
import { ACCEPTED } from '../constants';

let defaultAdminApp = null;
if (process.env.NODE_ENV !== 'test') {
  // Dont initializeApp in test enviroment
  defaultAdminApp = admin.initializeApp({
    credential: admin.credential.cert(config.auth.firebaseAdmin),
    databaseURL: config.auth.firebase.databaseURL,
  });
}

export async function getChatToken({ email, password, accessToken, chatId }) {
  let result = {};
  try {
    if (chatId) {
      result.token = await defaultAdminApp.auth().createCustomToken(chatId);
    } else {
      let loginResult;
      if (email && password) {
        try {
          loginResult = await firebase.auth().signInWithEmailAndPassword(email, password);
        } catch (error) {
          loginResult = await firebase.auth().createUserWithEmailAndPassword(email, password);
        }
      } else {
        const credential = await firebase.auth.FacebookAuthProvider.credential(accessToken);
        loginResult = await chat.service.auth().signInWithCredential(credential);
      }
      const token = await defaultAdminApp.auth().createCustomToken(loginResult.uid);
      result = { chatId: loginResult.uid, token };
    }
  } catch (error) {
    console.error(error); // eslint-disable-line
    return null;
  }
  return result;
}

export function createChatUserIfNotExits(user) {
  const refUser = defaultAdminApp.database().ref('users');
  if (user && user.chatId) {
    refUser.child(user.chatId).once('value', (snap) => {
      const userData = snap.val();
      if (!userData || !userData.uid) {
        refUser.child(user.chatId).set(Object.assign({ uid: user.chatId }, pick(user, ['_id', 'username', 'profile'])));
      }
    });
  }
}

export async function verifiedChatToken(req, res) {
  try {
    const user = jwt.verify(req.cookies.id_token, config.auth.jwt.secret);
    if (user && user.chatToken && user.chatExp && moment(user.chatExp).diff(new Date()) < 0) {
      const chatToken = await defaultAdminApp.auth().createCustomToken(user.chatId);
      req.user = { ...user, chatToken, chatExp: moment().add(0, 'hours').unix() };
      const token = generateToken(omit(req.user, ['exp', 'iat']));
      res.cookie('id_token', token, { maxAge: 1000 * EXPIRES_IN });
      return req.user;
    }
  } catch (error) {
    return error;
  }
  return null;
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  UsersModel.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in with Local.
 */
passport.use(new LocalStrategy({
  session: false,
}, (usernameVal, passwordVal, done) => {
  const fooBar = async () => {
    const options = {
      $or: [
        { username: usernameVal },
        { 'phone.number': usernameVal, 'phone.verified': true },
        { 'emails.address': usernameVal, 'emails.verified': true },
      ],
    };

    const user = await UsersModel.findOne(options);
    if (!user) {
      return done({
        name: 'IncorrectUsernameError',
        message: 'Tài khoản đăng nhập không tồn tại.',
      });
    }

    // check if a hashed user's password is equal to a value saved in the database
    // return UsersModel.validPassword(user.password);
    const validPassword = await bcrypt.compare(passwordVal, user.password);
    if (!validPassword) {
      return done({
        name: 'IncorrectPasswordError',
        message: 'Mật khẩu không đúng.',
      });
    }

    const buildingsApprove = await BuildingMembersModel.find({ user: user._id, status: ACCEPTED });
    let chatToken = null;
    const { emails, password, chatId } = user;

    if (chatId) {
      chatToken = await getChatToken({ chatId });
    } else if ((emails && emails.address) && password) {
      chatToken = await getChatToken({ email: emails.address, password: passwordVal });
    }

    return done(null, {
      id: user._id || '',
      profile: user.profile || {},
      email: (user.emails && user.emails.address) || '',
      roles: user.roles || [],
      chatToken: (chatToken && chatToken.token) || '',
      chatExp: moment().add(1, 'hours').unix(),
      chatId: user && user.chatId,
      buildings: [] || buildingsApprove,
      isActive: user.isActive || 0,
    });
  };

  fooBar().catch(done);
}));

/**
 * Sign in with Facebook.
 */
passport.use(new FacebookTokenStrategy({
  clientID: config.auth.facebook.id,
  clientSecret: config.auth.facebook.secret,
}, (accessToken, refreshToken, profile, done) => {
  const fooBar = async () => {
    try {
      let user = null;
      if (profile._json.email) {
        user = await UsersModel.findOne({
          'emails.address': profile._json.email,
        });
      } else {
        let username = null;
        if (profile && profile._json && profile._json.last_name && profile._json.first_name) {
          username = removeToneVN(`${profile._json.last_name}_${profile._json.first_name}`.replace(/\s/g, ''));
        } else if (profile.displayName) {
          username = removeToneVN(profile.displayName.replace(/\s/g, ''));
        }
        user = await UsersModel.findOne({
          username,
        });
      }
      let chatToken;
      if (!user) {
        chatToken = await getChatToken({ accessToken });
        user = await createAccountWithFB(accessToken, profile, chatToken);
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

      const buildingsApprove = await BuildingMembersModel.find({ user: user._id, status: ACCEPTED });

      done(null, {
        id: user._id,
        profile: user.profile,
        email: (user.emails && user.emails.address) || '',
        roles: user.roles,
        chatToken: chatToken && chatToken.token,
        chatExp: moment().add(1, 'hours').unix(),
        chatId: user && user.chatId,
        buildings: buildingsApprove || [],
        isActive: user.isActive || 0,
      });
    } catch (e) {
      console.log(e);
    }
  };

  fooBar().catch(done);
}));

export default passport;
