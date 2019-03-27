const express = require('express');
const db = require('../../common/db');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});

// set as seen only the ONE message with msgId you send
router.put('/', async (req, res) => {
  let date = Date.now();
  try {
    // Check arguments
    if (req.body.msgId === undefined) {
      return res.status(400).send({
        message: 'Missing ids',
        code: 400
      });
    }

    let { from, to, seen } = (await db.query(
      `SELECT msg_from AS from, msg_to AS to, seen
      FROM messages
      WHERE msg_id = $1;`,
      [req.body.msgId]
    )).rows[0] || {};

    if (!from || !to) {
      return res.status(404).send({
        message: 'Message Not Found',
      });
    }

    if (parseInt(to) !== parseInt(req.user.id)) {
      return res.status(403).send({
        message: 'Forbidden',
        code: 403
      });
    }

    if (!seen) {
      // perform seen
      await db.query(
        `UPDATE messages
          SET seen=true, seen_ts=$1
          FROM (SELECT * FROM messages WHERE msg_id=$2) AS msg
          WHERE
            messages.msg_ts <= msg.msg_ts
            AND messages.msg_to = msg.msg_to
            AND messages.msg_from = msg.msg_from;
        `,
        [date, req.body.msgId]
      );
    }
  } catch (error) {
    return res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    });
  }
  return res.status(204).end();
});

module.exports = router;
