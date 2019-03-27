const express = require('express');
const userExists = require('../../common/user-exists');
const db = require('../../common/db');
const privateProfile = require('../../common/userid-to').privateProfile;

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});

router.get('/', async (req, res) => {
  var userid = req.query.uid;
  // If not uid in query --> 400
  if (!userid) {
    return (
      res.status(400).send({
        message: 'Bad Request: Missing parameter',
        code: 400
      })
    );
  }
  // Only you can get your own conversations
  if (req.user.id !== parseInt(userid)) {
    return (
      res.status(403).send({
        message: 'Unauthorized',
        code: 403
      })
    );
  }
  try {
    // If user does not exist --> 404
    if (!(await userExists.fn(userid))) {
      return (
        res.status(404).send({
          message: 'User Not Found',
          code: 404
        })
      );
    }
    // Get the list of user1's matches
    let matches = (await db.query(
      `
      SELECT match_id
      FROM
        (
          SELECT user_1 as match_id, created
          FROM match_log
          WHERE user_2=$1
          AND unmatched IS NULL AND latest
          UNION
          SELECT user_2 as match_id, created
          FROM match_log
          WHERE user_1=$1
          AND unmatched IS NULL AND latest
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
      WHERE blocked IS NULL
      ORDER BY created DESC;`,
      [userid])).rows;
    // Get the last messages user1 exchanged with it matches
    var lastMessages = [];
    for (let i in matches) {
      let lastMessage = (await db.query(
        `SELECT
          msg_id AS id,
          msg_ts AS time,
          msg_from AS from,
          msg_to AS to,
          msg_txt AS txt,
          seen
        FROM messages
        WHERE ((msg_to = $1 AND msg_from = $2) OR (msg_to = $2 AND msg_from = $1))
        ORDER BY msg_ts DESC
        LIMIT 1;`,
        [userid, matches[i].match_id])).rows[0];
      lastMessages[i] = {
        userid: matches[i]['match_id'],
        profile: await privateProfile(matches[i]['match_id']),
        ...lastMessage
      };
    }
  } catch (error) {
    return (res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    }));
  }
  return (
    res.status(200).send(
      lastMessages
    )
  );
});

module.exports = router;
