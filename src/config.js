/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright � 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* eslint-disable max-len */

export const port = process.env.PORT || 3000;
export const host = process.env.WEBSITE_HOSTNAME || `localhost:${port}`;

export const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost/sns_test';

export const analytics = {

  // https://analytics.google.com/
  google: {
    trackingId: process.env.GOOGLE_TRACKING_ID, // UA-XXXXX-X
  },

};

export const auth = {

  jwt: { secret: process.env.JWT_SECRET || 'React Starter Kit' },

  // https://developers.facebook.com/
  facebook: {
    id: process.env.FACEBOOK_APP_ID || '678961598943405',
    secret: process.env.FACEBOOK_APP_SECRET || '06a4ac09ae386fa9779547a6de5c0dd3',
  },

  // https://cloud.google.com/console/project
  google: {
    id: process.env.GOOGLE_CLIENT_ID || '251410730550-ahcg0ou5mgfhl8hlui1urru7jn5s12km.apps.googleusercontent.com',
    secret: process.env.GOOGLE_CLIENT_SECRET || 'Y8yR9yZAhm9jQ8FKAL8QIEcd',
  },

  // https://apps.twitter.com/
  twitter: {
    key: process.env.TWITTER_CONSUMER_KEY || 'Ie20AZvLJI2lQD5Dsgxgjauns',
    secret: process.env.TWITTER_CONSUMER_SECRET || 'KTZ6cxoKnEakQCeSpZlaUCJWGAlTEBJj0y2EMkUBujA7zWSvaQ',
  },
  firebase: {
    apiKey: 'AIzaSyDgbPU5DuXmvxWprMwc-HxTMae05c6rCPc',
    authDomain: 'snschat-fb64b.firebaseapp.com',
    databaseURL: 'https://snschat-fb64b.firebaseio.com',
    projectId: 'snschat-fb64b',
    storageBucket: 'snschat-fb64b.appspot.com',
    messagingSenderId: '1034925992768',
  },
};
