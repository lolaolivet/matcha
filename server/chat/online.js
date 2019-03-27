const users = require('./users');
const { query } = require('./db');

module.exports = (userid, socket) => async (clientFn) => {
  try {
    // Get the list of the user's matches that are connected
    var connected = await users.getListOfConnectedContacts(userid);
  } catch (err) {
    if (clientFn) clientFn('error', 0);
    return;
  }

  // log the last time user was connected
  try {
    query('UPDATE user_info SET last_in = $1 WHERE user_id = $2;', [Date.now(), userid]);
  } catch (error) {
    console.error(error);
  }
  // Save the user
  const ok = users.saveClient(userid, socket.id);
  if (ok) {
    // Acknowledge
    if (clientFn) clientFn(connected);
  } else {
    if (clientFn) clientFn('error', 1);
  }
};
