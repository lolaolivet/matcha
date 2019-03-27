const authRouter = require('express-promise-router')();
const db = require('../..//db');

const writeMsg = async (msg) => {
  var Ok = await db.query(`
    INSERT INTO messages (msg_ts, msg_from, msg_to, msg_txt)
    VALUES ($1, $2, $3, $4)
  `, [Date.now(), msg.from, msg.to, msg.txt]
  );
  return Ok;
};

const lastMsgIdsFrom1 = async (nbIds, between) => {
  var ids = await db.query(`
  SELECT msg_id FROM messages
  WHERE  
  (msg_to = $2 AND msg_from = $1)
  ORDER BY msg_id DESC LIMIT $3;
  `, [between.user1, between.user2, nbIds]
  );
  // (msg_to = $1 AND msg_from = $2) OR
  return ids;
};

authRouter.post('/', async (req, res) => {
  // Validate the request body
  if (!(req.body.messages instanceof Array)) {
    return (
      res.status(400).json({
        message: 'Bad request'
      }).end()
    );
  }
  try {
    var between = { user1: req.body.messages[0].from,
      user2: req.body.messages[0].to };
    for (var i in req.body.messages) {
      // Log a new message
      await writeMsg(req.body.messages[i]);
    }
    var msgIds = (await lastMsgIdsFrom1(i, between)).rows;
  } catch (err) {
    return (res.status(500).send({
      message: 'Internal Server Error'
    }));
  }
  // Respond with auth tokens
  // return (res.status(202).json());
  return (res.status(202).json(msgIds));
});

module.exports = authRouter;

// authRouter.post('/', async (req, res) => {
//   console.log('hu');
//   // Validate the request body
//   if (!(req.body.messages instanceof Array)) {
//     return (
//       res.status(400).json({
//         message: 'Bad request'
//       }).end()
//     );
//   }
//   try {
//     for (var i in req.body.messages) {
//       // Log a new message
//       let dac = await writeMsg(req.body.messages[i]);
//       console.log(dac);
//     }
//   } catch (err) {
//     return (res.status(500).send({
//       message: 'Internal Server Error'
//     }));
//   }
//   // Respond with auth tokens
//   return (res.status(202).json());
//   // return (res.status(202).json(msgIds));
// });
