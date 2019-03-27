const express = require('express');
const userExists = require('../common/user-exists');
const db = require('../common/db');
const sendNotif = require('../common/send-notif');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});

/*

  Posibilities for block and unblock

  1 : blocker
  2 : user that was blocked
  u : unblocked
  l : latest

  |  1  |  2  ||  U  |  L  |
  | --- | --- || --- | --- |
  |     |     ||     |     |
  |  A  |  B  ||  0  |  1  | <- is blocked : can only be unblocked
  |     |     ||     |     |
  |  A  |  B  ||  1  |  0  | <- archive : ignored
  |     |     ||     |     |
  |  A  |  B  ||  1  |  1  | <- unblocked : can block again
  |     |     ||     |     |
  |  A  |  B  ||  0  |  0  | <- impossible : should not exist, cannot block twice thus : (unblocked = false) means (latest = true)

*/

router.post('/', async (req, res) => {
  let date = Date.now();
  try {
    // Check ids are given
    if (req.body.uid === undefined || req.body.blocked_uid === undefined) {
      // If ids not provided -> Error
      return (
        res.status(400).send({
          message: 'Missing ids',
          code: 400
        })
      );
    }

    if (req.body.uid !== req.user.id) {
      // If ids not provided -> Error
      return (
        res.status(403).send({
          message: 'You are not allowed to perform this action',
          code: 403
        })
      );
    }
    // Check that both exist
    var userUid = (await userExists.fn(req.body.uid));
    var blockedUid = (await userExists.fn(req.body.blocked_uid));
    if (!userUid || !blockedUid) {
      return res.status(404).send({
        message: 'User Not Found',
        code:
          (!userUid) // is receiver fake ?
            ? (!blockedUid) // is sender fake ?
              ? 4043 // both fake
              : 4042 // only receiver fake
            : 4041 // only sender fake
      });
    }
    // check that this user isn't curently blocked
    var isBlocked = (await db.query(
      `SELECT * FROM block_log
        WHERE user_id = $1
        AND blocked_id = $2
        AND unblocked IS NULL;`,
      [req.body.uid, req.body.blocked_uid])
    ).rows;
    if (isBlocked[0]) {
      return res.status(400).send({
        message: 'Cannot block a currently blocked person',
        code: 4009
      });
    }
    // Cannot block self
    if (parseInt(req.body.uid) === parseInt(req.body.blocked_uid)) {
      // If uid === blocked_uid -> Error
      return res.status(400).send({
        message: 'Cannot block self (neat isn\'t it ?)',
        code: 4002
      });
    }
    // refresh logs
    await db.query(
      `UPDATE block_log
      SET latest = 'f'
      WHERE user_id = $1 AND blocked_id = $2;`,
      [req.body.uid, req.body.blocked_uid]
    );
    // perform block
    await db.query(
      `INSERT INTO block_log
      (user_id, blocked_id, created, latest)
      VALUES ($1, $2, $3, TRUE);`,
      [req.body.uid, req.body.blocked_uid, date]
    );
    await sendNotif('block', req.body.uid, req.body.blocked_uid);
  } catch (error) {
    console.error(error);
    return (res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    }));
  }
  return (res.status(204).end());
});

module.exports = router;
