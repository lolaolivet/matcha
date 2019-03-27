const express = require('express');
const userExists = require('../common/user-exists');
const db = require('../common/db');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});

router.post('/', async (req, res) => {
  let date = Date.now();
  try {
    // Check ids are given
    if (req.body.uid === undefined || req.body.reported_uid === undefined) {
      // If ids not provided -> Error
      return (
        res.status(400).send({
          message: 'Missing ids',
          code: 400
        })
      );
    }

    if (parseInt(req.body.uid) !== parseInt(req.user.id)) {
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
    var reportedUid = (await userExists.fn(req.body.reported_uid));
    if (!userUid || !reportedUid) {
      return res.status(404).send({
        message: 'User Not Found',
        code:
          (!userUid) // is receiver fake ?
            ? (!reportedUid) // is sender fake ?
              ? 4043 // both fake
              : 4042 // only receiver fake
            : 4041 // only sender fake
      });
    }
    // Cannot report self
    if (parseInt(req.body.uid) === parseInt(req.body.reported_uid)) {
      // If uid === reported_uid -> Error
      return res.status(400).send({
        message: 'Cannot report self (neat isn\'t it ?)',
        code: 4002
      });
    }
    // perform report
    await db.query(
      `INSERT INTO report_log
      (user_id, reported_id, created, latest)
      VALUES ($1, $2, $3, TRUE);`,
      [req.body.uid, req.body.reported_uid, date]
    );
    // Block
    // refresh logs
    await db.query(
      `UPDATE block_log
      SET latest = 'f'
      WHERE user_id = $1 AND blocked_id = $2;`,
      [req.body.uid, req.body.reported_uid]
    );
    // perform block
    await db.query(
      `INSERT INTO block_log
      (user_id, blocked_id, created, latest)
      VALUES ($1, $2, $3, TRUE);`,
      [req.body.uid, req.body.reported_uid, date]
    );
  } catch (error) {
    return (res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    }));
  }
  return (res.status(204).end());
});

module.exports = router;
