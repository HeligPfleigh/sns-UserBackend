/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import path from 'path';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressJwt from 'express-jwt';
import expressGraphQL from 'express-graphql';
import jwt from 'jsonwebtoken';
// import React from 'react';
// import ReactDOM from 'react-dom/server';
// import { renderToStringWithData } from 'react-apollo';
// import UniversalRouter from 'universal-router';
// import PrettyError from 'pretty-error';

// import createApolloClient from './core/createApolloClient';
// import passport, { verifiedChatToken } from './core/passport';

import passport from './core/passport';
import schema from './data/schema';

// import assets from './assets.json'; // eslint-disable-line import/no-unresolved
// import configureStore from './store/configureStore';
// import { setRuntimeVariable } from './actions/runtime';
import { port, auth, databaseUrl } from './config';
import Mongoose from './data/mongoose';
// import chat from './core/chat';

// Create connect database
Mongoose.connect(databaseUrl, {});

const app = express();

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
const whitelist = [
  'http://localhost:3003',
  'http://sns-app.herokuapp.com',
  'https://sns-app.herokuapp.com',
  '*',
];
const corsOptions = {
  origin: (origin, callback) => {
    const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//
// Authentication
// -----------------------------------------------------------------------------
app.use(expressJwt({
  secret: auth.jwt.secret,
  credentialsRequired: false,
  getToken: (req) => {
    if (req.headers && req.headers.authorization) {
      return req.headers.authorization;
    }
    return req.cookies.id_token;
  },
}));
app.use(passport.initialize());

if (__DEV__) {
  app.enable('trust proxy');
}
app.get('/login/facebook',
  passport.authenticate('facebook', { scope: ['email', 'user_location'], session: false }),
);
app.get('/login/facebook/return',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const expiresIn = 60 * 60 * 24 * 180;
    const token = jwt.sign(req.user, auth.jwt.secret, { expiresIn });
    res.cookie('id_token', token, { maxAge: 1000 * expiresIn, httpOnly: true });
    res.redirect('/');
  },
);

app.get('/logout', (req, res) => {
// app.post('/logout', (req, res) => {
  res.clearCookie('id_token');
  res.redirect('/');
});

//
// Register API middleware
// -----------------------------------------------------------------------------
const graphqlMiddleware = expressGraphQL(req => ({
  schema,
  graphiql: __DEV__,
  rootValue: { request: req },
  pretty: __DEV__,
}));

app.use('/graphql', graphqlMiddleware);

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async (req, res) => {
  res.json({
    name: 'hello world!',
  });
});

//
// Error handling
// -----------------------------------------------------------------------------

//
// Launch the server
// -----------------------------------------------------------------------------
/* eslint-disable no-console */
app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}/`);
});
/* eslint-enable no-console */
