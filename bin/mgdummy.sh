#!/usr/bin/env ./node_modules/.bin/babel-node
import mongoose from 'mongoose';
import isFunction from 'lodash/isfunction';
import { data as users } from './users';

const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost/sns_test';
const logger = console;

connect(databaseUrl, {}, async (connection) => {
  try {
    const UsersModel = connection.db.collection('users');
    await connection.dropDatabase();
    for (let i = 0, length = users.length; i < length; i++){
      await UsersModel.insert(users[i]);
    }
    process.exit(0);
  }
  catch(e){
    logger.error(e.message);
    process.exit(1);
  }
});

function connect (uri, options, cb) {
  // http://mongodb.github.io/node-mongodb-native/2.0/api/Server.html#connections
  options.server = {
    socketOptions: { keepAlive: 1 }
  };
  options.auto_reconnect = true;

  const connect = mongoose.createConnection(uri, options);

  // CONNECTION EVENTS
  // When successfully connected
  connect.on('connected', function () {
    logger.info('Mongoose default connection open to ' + uri);
    isFunction(cb) && cb(connect);
  });

  // If the connection throws an error
  connect.on('error', function (err) {
    logger.crit('Failed to connect to DB ' + uri + ' on startup ' + err.message);
  });

  // When the connection is disconnected
  connect.on('disconnected', function () {
    logger.warn('Mongoose default connection to DB :' + uri +
      ' disconnected'
    );
  });

  const gracefulExit = function () {
    connect.close(function () {
      logger.info(
        'Mongoose default connection with DB :' + uri +
        ' is disconnected through app termination'
      );
      process.exit(0);
    });
  };
  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

  return connect;
}

/**
import path from 'path';
import nconf from 'nconf';
import fs from 'fs';
import fixtures from './fixtures';
import logger from '../src/server/logger';
import {
  UserModel,
  BizManagerAccountModel,
  LocalbizModel,
  CityModel,
  CharacteristicModel,
  CategoryModel,
  ServingModel,
  DistrictModel,
  PhotoModel,
  ReviewsModel,
  EventsModel,
  LocalBizUpdateRequestModel,
  ConfigModel,
} from '../src/server/models';

nconf.env().argv();
const env = nconf.get('NODE_ENV') || 'development';

let instance = null;

function relativePath(...p) {
  p.unshift(__dirname);
  return path.join(...p);
}



// Mongo
let primaryData = null;
function connectPrimaryData (uri, options, isFixture = false) {
  if(!primaryData) {
    const db = nconf.get('db');
    uri = db ? db.uri : uri;
    options = db ? db.options : options;
    primaryData = connect(uri, options, function () {
      fixtures(primaryData);
    });
    UserModel(primaryData);
    BizManagerAccountModel(primaryData);
    LocalbizModel(primaryData);
    CityModel(primaryData);
    CharacteristicModel(primaryData);
    CategoryModel(primaryData);
    ServingModel(primaryData);
    DistrictModel(primaryData);
    PhotoModel(primaryData);
    ReviewsModel(primaryData);
    LocalBizUpdateRequestModel(primaryData);
    ConfigModel(primaryData);
  }
  return primaryData;
}

(async function () {
  try {
    let f = 'development.json';
    if (env === 'production') {
      logger.warn('we dont insert dummy data on production, dude !!!');
      process.exit(0);
    }
    if (env === 'staging') {
      f = 'staging.json';
    }
    if (env === 'tests') {
      f = 'tests.json';
    }
    nconf.file({
      file: relativePath('..', 'config', `${f}`)
    }).defaults({});

    connectPrimaryData();
  }
  catch(e) {
    logger.warn(e.message);
    process.exit(0);
  }
})();
*/
