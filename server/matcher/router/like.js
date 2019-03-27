const express = require('express');
const bodyParser = require('body-parser');

const sendNotif = require('../common/send-notif');
const db = require('../common/db');
const userExists = require('../common/user-exists');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});
router.use(bodyParser.json());

// Like an other user
router.post('/', async (req, res) => {
  let date = Date.now();

  try {
    const sender = req.body.sender;
    const receiver = req.body.receiver;
    // Check ids are given
    if (sender === undefined || receiver === undefined) {
      // If ids not provided -> Error
      return (
        res.status(400).send({
          message: 'Missing ids',
          code: 400
        })
      );
    }

    if (sender !== req.user.id) {
      // If ids not provided -> Error
      return (
        res.status(403).send({
          message: 'You are not allowed to perform this action',
          code: 403
        })
      );
    }

    // Check that both exist
    var receiverExists = (await userExists.fn(receiver));
    var senderExists = (await userExists.fn(sender));
    if (!receiverExists || !senderExists) {
      // Second user does not exist
      return res.status(404).send({
        message: 'User Not Found',
        code:
          (!receiverExists) // is receiver fake ?
            ? (!senderExists) // is sender fake ?
              ? 4043 // both fake
              : 4042 // only receiver fake
            : 4041 // only sender fake
      });
    }
    // Cannot like self
    if (parseInt(receiver) === parseInt(sender)) {
      // If sender === receiver -> Error
      return res.status(400).send({
        message: 'Cannot like self (saddest error message I have ever had to write)',
        code: 4002
      });
    }

    // check if one or the other is blocked
    const block = (await db.query(
      `SELECT * FROM block_log
      WHERE ((blocked_id=$1 AND user_id=$2)
      OR (blocked_id=$2 AND user_id=$1))
      AND unblocked IS NULL AND latest`,
      [receiver, sender]
    )).rows[0];
    if (block !== undefined) {
      return res.status(400).send({
        message: 'Cannot like or be liked by somebody blocked from you',
        code: 4002
      });
    }
    // refresh logs
    await db.query(
      `UPDATE like_log
      SET latest = 'f'
      WHERE sender_id = $1 AND receiver_id = $2;`,
      [sender, receiver]
    );
    // Perform like
    await db.query(
      `INSERT INTO like_log
        (sender_id, receiver_id, created, latest)
        VALUES ($1, $2, $3, TRUE)`,
      [sender, receiver, date]
    );

    // Check other also liked
    var likedBack = (await db.query('SELECT unliked FROM like_log WHERE sender_id=$1 AND receiver_id=$2 AND latest', [receiver, sender])).rows[0];
    var matched = (await db.query('SELECT unmatched FROM match_log WHERE ((user_1=$1 AND user_2=$2) OR (user_1=$2 AND user_2=$1)) AND latest', [receiver, sender])).rows[0];
    if (likedBack !== undefined && !likedBack.unliked && (matched === undefined || matched.unmatched)) {
      // If liked and not unliked and not matched yet or unmatched --> match
      await db.query(
        `UPDATE match_log
        SET latest = 'f'
        WHERE (user_1 = $1 AND user_2 = $2) OR (user_1 = $2 AND user_2 = $1);`,
        [receiver, sender]
      );
      await db.query(
        `INSERT INTO match_log
          (user_1, user_2, created, latest)
          VALUES ($1, $2, $3, TRUE)`,
        [receiver, sender, date] // First user to like is user_1
      );
      await sendNotif('match', sender, receiver);
      return (res.status(200).send('Match!'));
    }
    await sendNotif('like', sender, receiver);
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
