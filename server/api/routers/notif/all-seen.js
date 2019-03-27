const express = require('express');
const userExists = require('../../common/user-exists');
const db = require('../../common/db');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});

// GET
router.get('/', async (req, res) => {
  // userid correspond to the receiver of the notifications to get
  const userid = req.user.id;
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
    // perform the get
    var notifications = (await db.query(
      `SELECT *
        FROM
          (
            SELECT * FROM notifications
            WHERE receiver=$1 AND seen IS NULL
            ORDER BY created DESC
          ) AS all_notifs
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
        ON blocked_ar.blocked = all_notifs.sender
        WHERE blocked IS NULL;`,
      [userid]
    )).rows;
  } catch (error) {
    return (res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    }));
  }
  return (
    res.status(200).send(notifications)
  );
});

// PUT
router.put('/', async (req, res) => {
  let date = Date.now();
  // userid correspond to the receiver of the notifications to get
  const userid = req.body.userid;
  const type = req.body.notif;
  // Check id is given
  if (userid === undefined) {
    return res.status(400).send({
      message: 'Missing id',
      code: 4001
    });
  }
  try {
    if (!(await userExists.fn(userid))) {
      return res.status(404).send({
        message: 'User Not Found',
      });
    }

    await db.query(
      `
      UPDATE notifications SET seen=true, modified=$1
      WHERE notifications.receiver=$2 AND notifications.notif=$3;`,
      [date, userid, type]
    );
  } catch (error) {
    return res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    });
  }
  return res.status(204).end();
});

module.exports = router;
