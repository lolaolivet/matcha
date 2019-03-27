const db = require('../common/db');
const useridTo = require('../common/userid-to');
const userExists = require('../common/user-exists');

module.exports = async (req, res) => {
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
    // Get the list of all of this user's likes (given and received)
    var given = (
      await db.query(
        `SELECT receiver_id, created
        FROM
          (
              SELECT
              receiver_id,
              created
            FROM like_log
            WHERE sender_id=$1
            AND unliked IS NULL
            AND latest
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
        ON blocked_ar.blocked = all_ids.receiver_id
        WHERE blocked IS NULL
        ORDER BY created DESC;
        `, [userid])
    ).rows;
    var received = (
      await db.query(
        `SELECT sender_id, created
        FROM
          (
              SELECT
              sender_id,
              created
            FROM like_log
            WHERE receiver_id=$1
            AND unliked IS NULL
            AND latest
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
        ON blocked_ar.blocked = all_ids.sender_id
        WHERE blocked IS NULL
        ORDER BY created DESC;
        `, [userid])
    ).rows;

    // Transform user ids into summary profiles
    for (let i in given) {
      given[i] = await useridTo.profileSummary(given[i].receiver_id);
    }
    for (let i in received) {
      received[i] = await useridTo.profileSummary(received[i].sender_id);
    }
    // // Translate to client keys
    // given = given.map(el => {
    //   return ({
    //     receiver: el['receiver_id'],
    //     date: el['created'] ? parseInt(el['created']) : null
    //   });
    // });
    // received = received.map(el => {
    //   return ({
    //     sender: el['sender_id'],
    //     date: el['created'] ? parseInt(el['created']) : null
    //   });
    // });

    // // Transform user ids into summary profiles
    // for (let i in given) {
    //   given[i].receiver = await useridTo.profileSummary(given[i].receiver);
    // }
    // for (let i in received) {
    //   received[i].sender = await useridTo.profileSummary(received[i].sender);
    // }
  } catch (error) {
    return (res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    }));
  }

  return (
    res.status(200).send({
      received,
      given
    })
  );
};
