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
import qs from 'qs';
import moment from 'moment';
import { Strategy as FacebookStrategy } from 'passport-facebook';
// import { User, UserLogin, UserClaim, UserProfile } from '../data/models';
import { auth as config } from '../config';
import { UserModel } from '../data/models';
import fetch from './fetch';

export async function getLongTermToken(accessToken) {
  const longlivedTokenRequest = await fetch(`https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${config.facebook.id}&fb_exchange_token=${accessToken}&client_secret=${config.facebook.secret}`);
  const longlivedTokenObject = qs.parse(await longlivedTokenRequest.text());
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
  clientID: config.facebook.id,
  clientSecret: config.facebook.secret,
  callbackURL: '/login/facebook/return',
  profileFields: ['name', 'email', 'link', 'locale', 'timezone', 'gender'],
  passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => {
  /* eslint-disable no-underscore-dangle */
  // const loginName = 'facebook';
  // const claimType = 'urn:facebook:access_token';
  const fooBar = async () => {
    const longlivedToken = await getLongTermToken(accessToken);
    let user = await UserModel.findOne({
      'emails.address': profile._json.email,
    });
    if (!user) {
      user = await UserModel.create({
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
        roles: ['user'],
        services: {
          facebook: longlivedToken,
        },
      });
    }
    done(null, {
      id: user._id,
      profile: user.profile,
      email: user.emails.address,
      roles: user.roles,
    });
  };

  fooBar().catch(done);
}));

export default passport;
