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
  // Only you can get your own views
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
    // Get the list of users the current user has viewed
    var viewed = (
      await db.query(
        `SELECT viewed_id, fullprofile
          FROM
            (
              SELECT
                viewed_id,
                created,
                fullprofile
              FROM display_log
              WHERE user_id=$1
              AND latest
              ORDER BY created DESC
            ) AS all_ids
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
          ON blocked_ar.blocked = all_ids.viewed_id
          WHERE blocked IS NULL;`,
        [userid])
    ).rows;
    viewed = viewed.map(el => {
      return ({
        uid: el['viewed_id'],
        date: el['created'] ? parseInt(el['created']) : null,
        fullprofile: el['fullprofile']
      });
    });
    // Get the list of users who have viewed the current user
    var viewedBy = (
      await db.query(
        `SELECT user_id, fullprofile
        FROM
          (
            SELECT
              user_id,
              created,
              fullprofile
            FROM display_log
            WHERE viewed_id=$1
            AND latest
            ORDER BY created DESC
          ) AS all_ids
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
        ON blocked_ar.blocked = all_ids.user_id
        WHERE blocked IS NULL;`,
        [userid])
    ).rows;
    viewedBy = viewedBy.map(el => {
      return ({
        uid: el['user_id'],
        date: el['created'] ? parseInt(el['created']) : null,
        fullprofile: el['fullprofile']
      });
    });
    // Transform user ids into summary profiles
    for (let i in viewed) {
      let full = viewed[i].fullprofile;
      viewed[i] = await useridTo.profileSummary(viewed[i].uid);
      viewed[i].fullprofile = full;
    }
    for (let i in viewedBy) {
      let full = viewedBy[i].fullprofile;
      viewedBy[i] = await useridTo.profileSummary(viewedBy[i].uid);
      viewedBy[i].fullprofile = full;
    }
  } catch (error) {
    return (res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    }));
  }

  return (
    res.status(200).send({ viewedBy, viewed })
  );
});

module.exports = router;
