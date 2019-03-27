const writeEmail = require('./writeEmail');

const createEmail = (confirmUrl) => writeEmail({
  text: 'Follow this link to confirm your new email',
  link: confirmUrl,
  emoji: '😉'
});

module.exports = createEmail;
