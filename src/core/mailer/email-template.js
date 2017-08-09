import { EmailTemplate } from 'email-templates';
import path from 'path';

const templatesPath = path.join(__dirname, 'mailer', 'templates');

const _render = async (template, email) => template.render({ email }, (email && email.lang) || null);

// Create email-template
const registrationEmailTemplate = new EmailTemplate(path.join(templatesPath, 'account', 'confirm_email'));
const RegistrationEmail = email => _render(registrationEmailTemplate, email);

const activatedEmailTemplate = new EmailTemplate(path.join(templatesPath, 'account', 'activated'));
const ActivatedEmail = email => _render(activatedEmailTemplate, email);

const forgotPasswordEmailTemplate = new EmailTemplate(path.join(templatesPath, 'account', 'forgot_password'));
const ForgotPasswordEmail = email => _render(forgotPasswordEmailTemplate, email);

const changedPasswordEmailTemplate = new EmailTemplate(path.join(templatesPath, 'account', 'change_password'));
const ChangedPasswordEmail = email => _render(changedPasswordEmailTemplate, email);

const approvedForUserBelongsToBuilding = email => _render(new EmailTemplate(path.join(templatesPath, 'account', 'approvedForUserBelongsToBuilding')), email);
const rejectedForUserBelongsToBuilding = email => _render(new EmailTemplate(path.join(templatesPath, 'account', 'rejectedForUserBelongsToBuilding')), email);

export default {
  registration: RegistrationEmail,
  activated: ActivatedEmail,
  forgot_password: ForgotPasswordEmail,
  change_pasword: ChangedPasswordEmail,
  approvedForUserBelongsToBuilding,
  rejectedForUserBelongsToBuilding,
};
