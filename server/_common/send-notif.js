const fetch = require('node-fetch');

const sendNotif = (type, sender, receiver) => {
  if (!(['match', 'view', 'unlike', 'like', 'block', 'unblock'].includes(type))) {
    throw new Error('Incorrect notification type');
  }

  return fetch(`http://chat:9003/${type}?sender=${sender}&receiver=${receiver}`, {
    headers: {
      authorization: process.env.MATCHA_SECRET
    }
  });
};

module.exports = sendNotif;