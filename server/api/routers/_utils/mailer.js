'use strict';

const nodemailer = require('nodemailer');
const writeNotificationMail = require('./mailtemplate-notification');
const writeConfirmMail = require('./mailtemplate-confirm');
const writePasswordMail = require('./mailtemplate-password');
const writeEmailMail = require('./mailtemplate-email');
const serverURL = process.env.MATCHA_SERVER_URL;
const senderEmail = process.env.AWS_SENDER || 'p@micel.co';
const uuid = require('uuid/v1');
const from = `"Team Matcha" <${senderEmail}>`;

const AWS = require('aws-sdk');
const region = 'eu-west-1';
AWS.config.update({ region });
var ses = new AWS.SES();

const sendMail = (options) => {
  // The character encoding for the email.
  const charset = 'UTF-8';

  // Extract variables from options
  const sender = options.from;
  const recipient = options.to;
  const subject = options.subject;

  // The email body for recipients with non-HTML email clients.
  const textBody = options.text;
  // The HTML body of the email.
  const htmlBody = options.html;

  // Specify the parameters to pass to the API.
  var params = {
    Source: sender,
    Destination: {
      ToAddresses: [
        recipient
      ],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: charset
      },
      Body: {
        Text: {
          Data: textBody,
          Charset: charset
        },
        Html: {
          Data: htmlBody,
          Charset: charset
        }
      }
    },
  };

  return (new Promise((resolve, reject) => {
    // Try to send the email.
    ses.sendEmail(params, function (err, data) {
      if (err) {
        reject(err.message);
      } else {
        resolve('Email sent! Message ID: ', data.MessageId);
      }
    });
  }));
};

/**
 * Use aws if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in env
 */

const AWS_SET = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_SENDER;
const transporter =
  AWS_SET
    ? { sendMail }
    : nodemailer.createTransport(
      {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: process.env.MATCHA_ETHER_ADDRESS,
          pass: process.env.MATCHA_ETHER_PWD,
        },
      }
    );

const createMailToken = (hours) => ({
  uuid: uuid(),
  exp: Date.now() + hours * (60 * 60 * 1000)
});

/**
 * Functions
 */

function sendMailConfirm (to, uid, tid) {
  const { html, text } = writeConfirmMail(`${serverURL}/confirm?uid=${uid}&tid=${tid}`);
  var mailOptions = {
    from,
    to,
    subject: 'Confirm your account',
    html,
    text,
  };

  return (transporter.sendMail(mailOptions));
}

function sendMailEmail (to, uid, tid) {
  const { html, text } = writeEmailMail(`${serverURL}/confirm?uid=${uid}&tid=${tid}`);
  var mailOptions = {
    from,
    to,
    subject: 'Confirm your email adress',
    html,
    text,
  };

  return (transporter.sendMail(mailOptions));
}

function sendMailPassword (to, uid, tid) {
  const { html, text } = writePasswordMail(`${serverURL}/new-pwd?uid=${uid}&tid=${tid}`);
  var mailOptions = {
    from,
    to,
    subject: 'Password reset',
    html,
    text,
  };

  return (transporter.sendMail(mailOptions));
}

function sendMailNotification (to, subject, msg) {
  const { html, text } = writeNotificationMail(msg);
  var mailOptions = {
    from,
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
