const express = require('express');
const bodyParser = require('body-parser');

const sendNotif = require('../common/send-notif');
const db = require('../common/db');
const userExists = require('../common/user-exists');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});
router.use(bodyParser.json());

/*

  Posibilities for like and unlike

  1 : liker
  2 : user that was liked
  u : unlike
  l : latest

  |  1  |  2  ||  U  |  L  |
  | --- | --- || --- | --- |
  |     |     ||     |     |
  |  A  |  B  ||  0  |  1  | <- is liked
  |     |     ||     |     |
  |  A  |  B  ||  0  |  0  | <- archive : ignored
  |     |     ||     |     |
  |  A  |  B  ||  1  |  0  | <- archive : ignored
  |     |     ||     |     |
  |  A  |  B  ||  1  |  1  | <- unliked : all previous likes ignored
  |     |     ||     |     |

  -------------

  Posibilities for match and unmatch

  1 : matcher
  2 : user that was matched
  u : unmatched
  l : latest

  |  1  |  2  ||  U  |  L  |
  | --- | --- || --- | --- |
  |     |     ||     |     |
  |  A  |  B  ||  0  |  1  | <- is matched : can only be unmatched
  |     |     ||     |     |
  |  A  |  B  ||  1  |  0  | <- archive : ignored
  |     |     ||     |     |
  |  A  |  B  ||  1  |  1  | <- unmatched : can match again
  |     |     ||     |     |
  |  A  |  B  ||  0  |  0  | <- impossible : should not exist, cannot match twice thus : (unmatched = false) means (latest = true)

*/

// Unlike an other user
router.put('/', async (req, res) => {
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
          code: 4001
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
    // Cannot unlike self
    if (parseInt(receiver) === parseInt(sender)) {
      // If sender === receiver -> Error
      return res.status(400).send({
        message: 'Cannot unlike self (neat isn\'t it ?)',
        code: 4002
      });
    }
    // check if one of you is blocked
    const block = (await db.query(
      `SELECT * FROM block_log
      WHERE ((blocked_id=$1 AND user_id=$2)
      OR (blocked_id=$2 AND user_id=$1))
      AND unblocked IS NULL AND latest`,
      [receiver, sender]
    )).rows[0];

    if (block !== undefined) {
      return res.status(400).send({
        message: 'Cannot unlike blocked user',
        code: 4002
      });
    }

    // Check that at least one like exists
    let lastLike = (await db.query(
      `SELECT * FROM like_log
      WHERE sender_id=$1 AND receiver_id=$2 AND latest
      `, [sender, receiver]
    )).rows[0];

    if (lastLike === undefined || lastLike['unliked'] === true) {
      return (res.status(400).send({
        message: 'Cannot unlike someone you never liked or already unliked',
        code: 4003
      }));
    }

    // Perform unlike
    await db.query(
      `UPDATE like_log
        SET unliked=true, modified = $3
        WHERE sender_id = $1 AND receiver_id = $2 AND latest
      `,
      [sender, receiver, date]
    );

    // Perform unmatch if needed
    await db.query(
      `UPDATE match_log
        SET unmatched=true, modified=$3
        WHERE
          (
            (user_1 = $1 AND user_2 = $2)
            OR
            (user_1 = $2 AND user_2 = $1)
          )
          AND unmatched IS NULL
          AND latest
      `,
      [sender, receiver, date]
    );

    await sendNotif('unlike', sender, receiver);
    return (res.status(204).end());
  } catch (error) {
    return (res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    }));
  }
});

module.exports = router;
