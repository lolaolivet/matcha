const express = require('express');
const userExists = require('../common/user-exists');
const db = require('../common/db');
const sendNotif = require('../common/send-notif');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});

router.post('/', async (req, res) => {
  let date = Date.now();
  try {
    // Check ids are given
    if (req.body.uid === undefined || req.body.viewedUid === undefined) {
      // If ids not provided -> Error
      return (
        res.status(400).send({
          message: 'Missing ids',
          code: 400
        })
      );
    }

    // Check that both exist
    var userUid = (await userExists.fn(req.body.uid));
    var viewedUid = (await userExists.fn(req.body.viewedUid));
    if (!userUid || !viewedUid) {
      return res.status(404).send({
        message: 'User Not Found',
        code:
          (!userUid) // is receiver fake ?
            ? (!viewedUid) // is sender fake ?
              ? 4043 // both fake
              : 4042 // only receiver fake
            : 4041 // only sender fake
      });
    }

    // refresh logs
    await db.query(
      `UPDATE display_log
      SET latest = 'f'
      WHERE user_id = $1 AND viewed_id = $2;`,
      [req.body.uid, req.body.viewedUid]
    );
    // perform view log
    await db.query(
      `INSERT INTO display_log
      (user_id, viewed_id, created, fullprofile, latest)
      VALUES ($1, $2, $3, $4, TRUE);`,
      [req.body.uid, req.body.viewedUid, date, req.body.full]
    );

    if (req.body.full) {
      await sendNotif('view', req.body.uid, req.body.viewedUid);
    }

    return (res.status(204).end());
  } catch (error) {
    console.error(error);
    return (res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    }));
  }
});

module.exports = router;
