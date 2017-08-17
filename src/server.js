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

import passport from './core/passport';
import schema from './data/schema';
import config from './config';
import Mongoose from './data/mongoose';

import UploadRouter from './core/uploads';
import MailRouter from './routes/MailRoutes';
import BuildingRouter from './routes/BuildingRoutes';
import AuthenticateRouter from './routes/AuthenticateRoutes';

const { port, auth, databaseUrl } = config;

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
// if (__DEV__) {
//   app.use(cors());
// } else {
const whitelist = [
  'http://localhost:3003',
  'http://localhost:3006',
  'http://localhost:8080',
  'http://sns.mttjsc.com',
  'http://sns-app.herokuapp.com',
  'https://sns-app.herokuapp.com',
  'https://sns.mttjsc.com',
];
const corsOptions = {
  origin: (origin, callback) => {
    const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  },
  credentials: true,
};
app.use(cors(corsOptions));
// }

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

// include routes
app.use('/auth', AuthenticateRouter);
app.use('/mailer', MailRouter);
app.use('/upload', UploadRouter);

app.use('/images', express.static(`${__dirname}/public/uploads`));
app.use('/buildings', BuildingRouter);

//
// Register API middleware
// -----------------------------------------------------------------------------
const graphqlMiddleware = expressGraphQL(req => ({
  schema,
  graphiql: __DEV__,
  rootValue: { request: req },
  pretty: __DEV__,
  // A value to pass as the context to the graphql() function from GraphQL.js.
  // If context is not provided, the request object is passed as the context.
  // This is an object shared by all resolvers in a particular query,
  // and is used to contain per-request state, including authentication information,
  // dataloader instances, and anything else that should be taken into account when
  // resolving the query.
  context: {
    user: req.user,
  },
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
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.log('Error handling');
  console.log(err);
});

//
// Launch the server
// -----------------------------------------------------------------------------
/* eslint-disable no-console */
app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}/`);
});
/* eslint-enable no-console */
