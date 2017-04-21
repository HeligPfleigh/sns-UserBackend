/**
Level of the logs:

- Emergency System is unusable.
A panic condition.
Eg: logger.log('emerg', 'message');

- Alert Action must be taken immediately.
A condition that should be corrected immediately, such as a corrupted system database.
Eg: logger.log('alert', 'message');

- Critical  Critical conditions, such as hard device errors.[8]
Eg: logger.log('crit', 'message');

- Error Error conditions.
Eg: logger.log('error', 'message');

- Warning Warning conditions.
Eg: logger.log('warning', 'message');

- Notice  Normal but significant conditions.
Conditions that are not error conditions, but that may require special handling.
Eg: logger.log('notice', 'message');

- Informational Informational messages.
Eg: logger.log('debug', 'message');

- Debug Debug-level messages.
Messages that contain information normally of use only when debugging a program.
Eg: logger.log('info', 'message');
*/

import winston from 'winston';
import fs from 'fs';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
// require('winston-syslog').Syslog;

let logsFolder = (() => {
  let folder = './logs/';
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    folder = './test_logs/';
  }
  if (process.env.SERVER_LOGS_FOLDER) {
    folder = process.env.SERVER_LOGS_FOLDER;
  }
  return folder;
})();
const APP_NAME = 'sns';

if (!path.isAbsolute(logsFolder)) {
  logsFolder = path.resolve(process.cwd(), logsFolder);
}
if (!fs.existsSync(logsFolder)) {
  fs.mkdirSync(logsFolder);
}

const currentTransports = [
  // new winston.transports.Syslog({
  //   host: '127.0.0.1',
  //   port: 32376,
  //   facility: 'local6',
  //   app_name: 'cas',
  // }),
  new (winston.transports.Console)({
    colorize: true,
    level: process.env.VERBOSE ? 'info' : 'info',
  }),
  new (DailyRotateFile)({
    filename: `${APP_NAME}.info`,
    dirname: logsFolder,
    name: APP_NAME,
    level: process.env.VERBOSE ? 'verbose' : 'info',
  }),
  new (DailyRotateFile)({
    filename: `${APP_NAME}.err`,
    dirname: logsFolder,
    name: `${APP_NAME}-error`,
    level: 'error',
  }),
];

const logger = new (winston.Logger)({
  transports: currentTransports,
  levels: winston.config.syslog.levels,
  colors: winston.config.syslog.colors,
});

export default logger;
