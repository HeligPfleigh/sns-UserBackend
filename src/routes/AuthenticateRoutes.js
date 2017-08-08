import express from 'express';
import passport from '../core/passport';
import UsersService from '../data/apis/UsersService';
import { generateToken, EXPIRES_IN } from '../utils/token';

const router = express.Router();

router.post('/check_user', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      throw new Error('Not exist params');
    }
    const status = await UsersService.checkExistUser(username);
    res.status(200).json({ status });
  } catch (error) {
    res.status(500).send({ status: false });
  }
});

router.post('/register', async (req, res) => {
  try {
    const user = await UsersService.createUser(req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.post('/active', async (req, res) => {
  try {
    const user = await UsersService.activeUser(req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (error, user) => {
    if (error || !user) {
      return res.status(401).json({
        error,
      });
    }
    const token = generateToken(user);
    res.cookie('id_token', token, { maxAge: 1000 * EXPIRES_IN });

    user.id_token = token;
    return res.status(200).json(user);
  })(req, res, next);
});

router.post('/facebook', (req, res, next) => {
  passport.authenticate('facebook-token', (error, user) => {
    if (error || !user) {
      return res.status(401).json({
        error,
      });
    }
    const token = generateToken(user);
    res.cookie('id_token', token, { maxAge: 1000 * EXPIRES_IN });

    user.id_token = token;
    return res.status(200).json(user);
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  res.clearCookie('id_token');
  res.redirect('/');
});

export default router;
