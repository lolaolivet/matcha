const express = require('express');
const userExists = require('../../common/user-exists');
const db = require('../../common/db');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});

router.get('/', async (req, res) => {
  var userid1 = req.query.uid1;
  var userid2 = req.query.uid2;
  // If not uid in query --> 400
  if (!userid1 || !userid2) {
    return (
      res.status(400).send({
        message: 'Bad Request: Missing parameter',
        code: 400
      })
    );
  }
  // Only you can get your own conversations
  if (req.user.id !== parseInt(userid1)) {
    return (
      res.status(403).send({
        message: 'Unauthorized',
        code: 403
      })
    );
  }
  try {
    // If user does not exist --> 404
    if (!(await userExists.fn(userid1))) {
      return (
        res.status(404).send({
          message: 'User Not Found',
          code: 404
        })
      );
    }
    if (!(await userExists.fn(userid2))) {
      return (
        res.status(404).send({
          message: 'User Not Found',
          code: 404
        })
      );
    }
    // check if users are currently matching
    let matching = (
      await db.query(
        `SELECT match_id
          FROM
            (
              SELECT CASE
              WHEN user_1=$1
              THEN user_2
              ELSE user_1 END AS match_id
              FROM match_log WHERE (user_1=$1 AND user_2=$2)
              AND unmatched IS NULL
                UNION
              SELECT CASE
              WHEN user_2=$1
              THEN user_1
              ELSE user_1 END AS match_id
              FROM match_log WHERE (user_1=$2 AND user_2=$1)
              AND unmatched IS NULL
            ) AS match_ids
          LEFT JOIN
            (
              SELECT user_id AS blocked
              FROM block_log
              WHERE blocked_id=$1
              AND unblocked IS NULL AND latest
                UNION
              SELECT blocked_id AS blocked
              FROM block_log
              WHERE user_id=$1
              AND unblocked IS NULL AND latest
            ) AS blocked_ar
          ON blocked_ar.blocked = match_ids.match_id
          WHERE blocked IS NULL;`,
        [userid1, userid2]
      )
    ).rows;
    if (matching[0] === undefined) {
      return res.status(400).send({
        message: 'Cannot speak to somebody you did\'nt match (neat isn\'t it ?)',
        code: 4002
      });
    }
    // Otherwise
    // Get the messages user1 and user2 exchanged
    let rows = (
      await db.query(
        `SELECT
          msg_id,
          msg_ts,
          msg_from,
          msg_to,
          msg_txt,
          seen
        FROM messages
        WHERE (msg_to = $1 AND msg_from = $2)
        OR (msg_to = $2 AND msg_from = $1)
        ORDER BY msg_id ASC
        ;`,
        [userid1, userid2])
    ).rows;
    var conversation = rows.map(el => {
      return ({
        id: parseInt(el.msg_id),
        to: parseInt(el.msg_to),
        from: parseInt(el.msg_from),
        time: parseInt(el.msg_ts),
        seen: el.seen,
        txt: el.msg_txt
      });
    });
  } catch (error) {
    return (res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    }));
  }
  return (
    res.status(200).send(
      conversation
    )
  );
});

module.exports = router;
