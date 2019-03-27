const nodemailer = require('nodemailer');
const writeNotificationMail = require('./mailtemplate-notification');
const writeConfirmMail = require('./mailtemplate-confirm');
const writePasswordMail = require('./mailtemplate-password');
const writeEmailMail = require('./mailtemplate-email');
const serverURL = process.env.MATCHA_SERVER_URL;
const uuid = require('uuid/v1');

const createMailToken = (hours) => ({
  uuid: uuid(),
  exp: Date.now() + hours * (60 * 60 * 1000)
});

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.MATCHA_ETHER_ADDRESS,
    pass: process.env.MATCHA_ETHER_PWD,
  },
});

function sendMailConfirm (to, uid, tid) {
  const {html, text} = writeConfirmMail(`${serverURL}/confirm?uid=${uid}&tid=${tid}`);
  var mailOptions = {
    from: '"Team Matcha" <p@micel.co>',
    to,
    subject: 'Confirm your account',
    html,
    text, 
  };

  return (transporter.sendMail(mailOptions));
}

function sendMailEmail (to, uid, tid) {
  const {html, text} = writeEmailMail(`${serverURL}/confirm?uid=${uid}&tid=${tid}`);
  var mailOptions = {
    from: '"Team Matcha" <p@micel.co>',
    to,
    subject: 'Confirm your email adress',
    html,
    text, 
  };

  return (transporter.sendMail(mailOptions));
}

function sendMailPassword (to, uid, tid) {
  const {html, text} = writePasswordMail(`${serverURL}/new-pwd?uid=${uid}&tid=${tid}`);
  var mailOptions = {
    from: '"Team Matcha" <p@micel.co>',
    to,
    subject: 'Password reset',
    html,
    text, 
  };

  return (transporter.sendMail(mailOptions));
}

function sendMailNotification (to, subject, msg) {
  const {html, text} = writeNotificationMail(msg);
  var mailOptions = {
    from: '"Team Matcha" <p@micel.co>',
    to,
    subject: subject,
    html,
    text, 
  };
  return (transporter.sendMail(mailOptions));
}

module.exports = {
  sendMailConfirm,
  sendMailPassword,
  sendMailEmail,
  sendMailNotification,
  createMailToken,
};
