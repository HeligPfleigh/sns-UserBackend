import nodemailer from 'nodemailer';
import pick from 'lodash/pick';

import config from '../../config';
import templates from './email-template';

const transporter = nodemailer.createTransport(config.mailer.smtp || {});

async function sendMail(email) {
  if (email && email.template) {
    try {
      const result = await templates[email.template](email);
      if (result) {
        if (result.html) {
          email.html = result.html;
        }
        if (result.subject) {
          email.subject = result.subject;
        }
      }
    } catch (error) {
      return false;
    }
  }
  email.from = email.from || config.mailer.from;
  const mailObject = pick(email, ['from', 'to', 'cc', 'bcc', 'subject', 'html']);
  try {
    await transporter.sendMail(mailObject);
    return true;
  } catch (error) {
    return false;
  }
}

export default {
  sendMail,
};
