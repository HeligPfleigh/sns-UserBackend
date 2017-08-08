import express from 'express';
import Mailer from '../core/mailer';

const router = express.Router();

router.get('/send', async (req, res) => {
  const mailObject = {
    to: 'linh.le@mttjsc.com',
    subject: 'Hello ✔',
    template: 'registration',
    lang: 'vi-vn',
    data: {
      username: 'ninjavungve',
      email: 'ninjavungve@gmail.com',
      password: 'abc12345',
    },
  };

  const result = await Mailer.sendMail(mailObject);

  if (JSON.parse(result)) {
    res.status(200).send(result);
  } else {
    res.status(500).send('Send mail error');
  }
});

export default router;
