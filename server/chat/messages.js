const { getUserClients } = require('./users');
const { query } = require('./db');
const { saveNotif } = require('./notifications');

module.exports = {
  onMessage: (io, from) => async ({ to, message }) => {
    // All the receiver's clients
    const receiverClients = getUserClients(to);
    // All the sender's clients
    const senderClients = getUserClients(from);

    message = message.replace(/ +(?= )/g, '');

    if (!message) {
      // ignore
      return;
    }

    // get the last message id
    const newMsgId = await query(`
      SELECT MAX(msg_id)
      FROM messages
      WHERE (msg_to = $1 AND msg_from = $2)
      OR (msg_to = $2 AND msg_from = $1);`,
    [from, to]);
    // object with message informations that the front needs
    const data = {
      from: from,
      to: to,
      time: Date.now(),
      txt: message,
      id: newMsgId.rows[0].max + 1,
      seen: false
    };

    // Insert into db
    await query(`
        INSERT INTO messages (msg_ts, msg_from, msg_to, msg_txt)
        VALUES ($1, $2, $3, $4)
      `, [Date.now(), from, to, message]);

    // If the receiver has any client, broadcast directly to them
    if (receiverClients) {
      const notif = await saveNotif({
        receiver: to,
        type: 'message',
        sender: from,
        created: Date.now()
      });
      receiverClients.map((socketId) => {
        io.to(socketId).emit('message', data);
        io.to(socketId).emit('notification', notif);
      });
    }

    // If the sender has any client, broadcast directly to them
    if (senderClients) {
      senderClients.map((socketId) => {
        io.to(socketId).emit('message', data);
      });
    }
  }
};
