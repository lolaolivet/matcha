const jwt = require('jsonwebtoken');
const secret = process.env.MATCHA_SECRET;

module.exports = async (socket, data, callback) => {
  const token = data;
  let user;
  try {
    user = jwt.verify(token, secret);
    if (user) {
      socket.client.user = user;
      return callback(null, true);
    } else {
      return callback(new Error('bad token'));
    }
  } catch (error) {
    console.error(error);
    return callback(error);
  }
};
