const express = require('express');
// const bodyParser = require('body-parser');

const db = require('../common/db');
const userExists = require('../common/user-exists');
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

router.put('/', async (req, res) => {
  let date = Date.now();

  try {
    // Check ids are given
    if (req.body.uid === undefined || req.body.unblock_uid === undefined) {
      // If ids not provided -> Error
      return res.status(400).send({
        message: 'Missing ids',
        code: 400
      });
    }

    if (req.body.uid !== req.user.id) {
      // If ids not provided -> Error
      return res.status(403).send({
        message: 'You are not allowed to perform this action',
        code: 403
      });
    }

    // Check that both exist
    var userUid = await userExists.fn(req.body.uid);
    var unblockUid = await userExists.fn(req.body.unblock_uid);
    if (!userUid || !unblockUid) {
      return res.status(404).send({
        message: 'User Not Found',
        code: !userUid // is receiver fake ?
          ? !unblockUid // is sender fake ?
            ? 4043 // both fake
            : 4042 // only receiver fake
          : 4041 // only sender fake
      });
    }
    // Cannot unblock self
    if (parseInt(req.body.uid) === parseInt(req.body.unblock_uid)) {
      // If uid === unblock_uid -> Error
      return res.status(400).send({
        message: "Cannot unblock self (neat isn't it ?)",
        code: 4002
      });
    }
    // check that this user is curently blocked
    let isBlocked = (await db.query(
      `SELECT * FROM block_log
        WHERE
          user_id = $1
          AND blocked_id = $2
          AND unblocked IS NULL
          AND latest;`,
      [req.body.uid, req.body.unblock_uid]
    )).rows;

    if (isBlocked === undefined || isBlocked['unblocked'] === true) {
      return res.status(400).send({
        message:
          "Cannot unblock a person you didn't block or already unblocked",
        code: 4003
      });
    }

    // perform unblock
    if (isBlocked[0]) {
      await db.query(
        ` UPDATE block_log
            SET unblocked=true, last_modified=$3
            WHERE
            user_id = $1
            AND blocked_id = $2
            AND latest`,
        [req.body.uid, req.body.unblock_uid, date]
      );
      await sendNotif('unblock', req.body.uid, req.body.unblock_uid);
      return res.status(204).end();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    });
  }
});

module.exports = router;
