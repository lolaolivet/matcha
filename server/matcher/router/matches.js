const express = require('express');
const router = express.Router({
  mergeParams: true // inherit params from earlier router
});
const db = require('../common/db');
const userExists = require('../common/user-exists');
const useridToProfileSummary = require('../common/userid-to').profileSummary;

router.get('/', async (req, res) => {
  // Save query argument uid
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
  if (req.user.id !== undefined && req.user.id !== parseInt(userid)) {
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

    // Get the user's matches summary profiles
    var matches = (await db.query(`
    SELECT userid
    FROM
      (
        SELECT user_1 as userid, created
        FROM match_log
        WHERE user_2=$1
        AND unmatched IS NULL AND latest
        UNION
        SELECT user_2 as userid, created
        FROM match_log
        WHERE user_1=$1
        AND unmatched IS NULL AND latest
      ) AS userids
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
    ON blocked_ar.blocked = userids.userid
    WHERE blocked IS NULL
    ORDER BY created DESC;
    `, [userid])).rows;
    for (let i in matches) {
      matches[i] = await useridToProfileSummary(matches[i].userid);
    }

    // Return all matches
    return (res.status(200).send(matches));
  } catch (error) {
    console.error(error);
    return (
      res.status(500).send({
        message: 'Internal Server Error',
        code: 500
      })
    );
  }
});

module.exports = router;
