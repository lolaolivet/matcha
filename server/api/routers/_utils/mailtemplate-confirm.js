const writeEmail = require('./writeEmail');

const createEmail = (confirmUrl) => writeEmail({
  text: 'Follow this link to confirm your registration to Matcha',
  link: confirmUrl,
  emoji: '😉'
});

module.exports = createEmail;
