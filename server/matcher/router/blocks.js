const express = require('express');
const userExists = require('../common/user-exists');
const useridTo = require('../common/userid-to');
const db = require('../common/db');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});

router.get('/', async (req, res) => {
  var userid = req.query.uid;

  // If not uid in query --> 400
  if (userid === undefined) {
    return (
      res.status(400).send({
        message: 'Bad Request',
        code: 400
      })
    );
  }
  // Only you can get your own matches
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
    // Otherwise
    // Get the list of users this one blocked
    var blocked = (
      await db.query(
        `SELECT
          blocked_id,
          created
        FROM block_log
        WHERE user_id=$1
        AND blocked_id NOT IN (
          SELECT reported_id
          FROM report_log
          WHERE reported_id = block_log.blocked_id
          AND block_log.user_id = report_log.user_id
        )
        AND unblocked IS NULL
        AND latest
        ORDER BY created DESC;`,
        [userid])
    ).rows;
    blocked = blocked.map(el => {
      return ({
        uid: el['blocked_id'],
        date: el['created'] ? parseInt(el['created']) : null
      });
    });
    // Transform user ids into summary profiles
    for (let i in blocked) {
      blocked[i] = await useridTo.profileSummary(blocked[i].uid);
    }
  } catch (error) {
    return (res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    }));
  }

  return (
    res.status(200).send(
      blocked
    )
  );
});

module.exports = router;
