#!/usr/bin/env ./node_modules/.bin/babel-node
import mongoose from 'mongoose';
import isFunction from 'lodash/isfunction';
import { data as users } from './users';
import { data as posts } from './posts';

const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost/sns_test';
const logger = console;

connect(databaseUrl, {}, async (connection) => {
  try {
    const UsersModel = connection.db.collection('users');
    const PostsModel = connection.db.collection('posts');
    await connection.dropDatabase();
    for (let i = 0, length = users.length; i < length; i++){
      logger.info(`insert user id : ${users[i]._id}`);
      await UsersModel.insert(users[i]);
    }
    for (let i = 0, length = posts.length; i < length; i++){
      logger.info(`insert posts id : ${posts[i]._id}`);
      await PostsModel.insert(posts[i]);
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
