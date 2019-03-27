const writeEmail = require('./writeEmail');

const createEmail = (passwUrl) => writeEmail({
  text: 'Follow this link to change your password',
  link: passwUrl,
  emoji: '😉'
});

module.exports = createEmail;
