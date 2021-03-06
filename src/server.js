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
import jsonwebtoken from 'jsonwebtoken';
// import expressGraphQL from 'express-graphql';
import mime from 'mime';
import fs from 'fs';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import {
  graphqlExpress,
  graphiqlExpress,
} from 'graphql-server-express';
import { createServer } from 'http';

import passport from './core/passport';
import schema from './data/schema';
import config from './config';
import Mongoose from './data/mongoose';

import UploadRouter, { apolloUploadExpress } from './core/uploads';
import MailRouter from './routes/MailRoutes';
import BuildingRouter from './routes/BuildingRoutes';
import AuthenticateRouter from './routes/AuthenticateRoutes';
import CronjobRouter from './routes/CronjobRouter';

const { port, auth, databaseUrl } = config;

// Create connect database
Mongoose.connect(databaseUrl);

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
app.use('/cronjob', CronjobRouter);
app.use('/images', express.static(`${__dirname}/public/uploads`));
app.use('/document', express.static(`${__dirname}/public/documents`));
app.use('/public', express.static(`${__dirname}/public`));
app.use('/buildings', BuildingRouter);
app.get('/download/:filename', (req, res) => {
  const fullPath = (filepath, options = {}) => {
    const root = options.root;
    return (root) ? path.join(root, filepath) : filepath;
  };
  const fileExists = (filepath, options = {}) => {
    try {
      return fs.statSync(fullPath(filepath, options)).isFile();
    } catch (e) {
      return false;
    }
  };

  const filename = req.params.filename;
  const ext = path.extname(filename);
  const basename = path.basename(filename);
  const attachment = req.query.attachment || basename;
  const mimetype = mime.lookup(filename);
  const filePath = `${__dirname}/public/uploads/${filename}`;
  if (fileExists(filePath)) {
    const filestream = fs.createReadStream(`${__dirname}/public/uploads/${filename}`);

    res.setHeader('Content-disposition', `attachment; filename=${attachment}.${ext}`);
    res.setHeader('Content-type', mimetype);

    filestream.pipe(res);
  } else {
    const message = 'File does not exists.';
    res.status(404);
    res.json({ message });
  }
});

const subscriptionsEndpoint = `ws://localhost:${port}/subscriptions`;
//
// Register API middleware
// -----------------------------------------------------------------------------
const graphqlMiddleware = graphqlExpress(req => ({
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
  subscriptionsEndpoint,
}));

app.use('/graphql', apolloUploadExpress({
  // Optional, defaults to OS temp directory
  uploadDir: `${__dirname}/public/uploads`,
}), graphqlMiddleware);

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint,
}));

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
  /* eslint-disable no-console */
  console.log('Error handling');
  console.log(err);
});

// Wrap the express server so that we can attach the WebSocket for subscriptions
const ws = createServer(app);

//
// Launch the server
// -----------------------------------------------------------------------------
/* eslint-disable no-console */
ws.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}/`);
  // Set up the WebSocket for handling GraphQL subscriptions.
  /* eslint-disable no-new */
  new SubscriptionServer({
    execute,
    subscribe,
    schema,
    onConnect: async (connectionParams) => {
      if (connectionParams.token) {
        const userPromise = new Promise((resolve, reject) => {
          jsonwebtoken.verify(connectionParams.token, auth.jwt.secret, (err, decoded) => {
            if (err) { reject('Invalid Token'); }
            resolve(decoded);
          });
        });
        const result = await userPromise;
        return {
          user: result,
        };
      }
      return null;
    },
  }, {
    server: ws,
    path: '/subscriptions',
  });
});
/* eslint-enable no-console */
