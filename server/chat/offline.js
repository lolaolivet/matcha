const users = require('./users');

module.exports = (userid, socket) => async () => {
  // Save the user
  users.removeClient(userid, socket.id);
};  
