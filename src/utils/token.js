import jwt from 'jsonwebtoken';
import config from '../config';

const { auth } = config;
const EXPIRES_IN = 60 * 60 * 24 * 180;

function generateToken(user) {
  return jwt.sign(user, auth.jwt.secret, { expiresIn: EXPIRES_IN });
}

export {
  EXPIRES_IN,
  generateToken,
};
