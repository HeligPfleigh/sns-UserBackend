import mongoose from 'mongoose';
// import nconf from 'nconf';
import logger from './logger';

// http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;

const Mongoose = {
  connect: (uri, options) => {
    // http://mongodb.github.io/node-mongodb-native/2.0/api/Server.html#connections
    // options.server = options.server ? options.server : {
    //   socketOptions: { keepAlive: 1 },
    // };

    options.server = {
      socketOptions: { keepAlive: 1 },
    };

    options.auto_reconnect = true;

    // Create connect to database
    // http://mongoosejs.com/docs/connections.html
    mongoose.connect(uri, options);

    // CONNECTION EVENTS
    // When successfully connected
    mongoose.connection.on('connected', () => {
      logger.info(`Mongoose default connection open to ${uri}`);
    });

    // If the connection throws an error
    mongoose.connection.on('error', (err) => {
      logger.error(`Failed to connect to DB ${uri} on startup ${err.message}`);
    });

    // When the connection is disconnected
    mongoose.connection.on('disconnected', () => {
      logger.warning(`Mongoose default connection to DB : ${uri} disconnected`);
    });

    const gracefulExit = () => {
      mongoose.connection.close(() => {
        logger.info(`Mongoose default connection with DB : ${uri} is disconnected through app termination`);
        process.exit(0);
      });
    };
    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);
  },
};

export default Mongoose;
