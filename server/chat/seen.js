const { getUserClients } = require('./users');
const { query } = require('./db');

module.exports = {
  onSeen: (io, userid) => async ({ id }) => {
    try {
      const date = Date.now();
      // Check argument
      if (id === undefined) {
        throw new Error(`onSeen: missing argument id`);
      }

      let { from, to, seen } = (await query(
        `SELECT msg_from AS from, msg_to AS to, seen
        FROM messages
        WHERE msg_id = $1;`,
        [id]
      )).rows[0] || {};

      if (!from || !to) {
        throw new Error(`onSeen: Message ${id} does not exist`);
      }

      if (parseInt(to) !== parseInt(userid)) {
        throw new Error(`onSeen: User ${userid} can't set message sent to ${to} as "seen"`);
      }

      if (!seen) {
        // perform seen
        await query(
          `UPDATE messages
            SET seen=true, seen_ts=$1
            FROM (SELECT * FROM messages WHERE msg_id=$2) AS msg
            WHERE
              messages.msg_ts <= msg.msg_ts
              AND messages.msg_to = msg.msg_to
              AND messages.msg_from = msg.msg_from;
          `,
          [date, id]
        );
      }

      // All the originator's clients
      const originatorClients = getUserClients(from);
      // All the current user's clients
      const currentUserClients = getUserClients(userid);

      // If the receiver has any client, broadcast directly to them
      if (originatorClients) {
        originatorClients.map((socketId) => {
          io.to(socketId).emit('seen', { id, from, to });
        });
      }

      // If the sender has any client, broadcast directly to them
      if (currentUserClients) {
        currentUserClients.map((socketId) => {
          io.to(socketId).emit('seen', { id, from, to });
        });
      }

      return;
    } catch (error) {
      // Log
      console.error(error);
      // Halt
      return;
    }
  }
};
