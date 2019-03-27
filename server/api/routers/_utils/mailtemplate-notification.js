const writeEmail = require('./writeEmail');

const createEmail = (notification) => writeEmail({
  text: notification,
  emoji: '🌡'
});

module.exports = createEmail;
