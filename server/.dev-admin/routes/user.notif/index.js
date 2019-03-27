const authRouter = require('express-promise-router')();
const db = require('../..//db');

const createNotif = async (notif) => {
  return await db.query(`
    INSERT INTO notifications (notif, receiver, sender, created)
    VALUES ($1, $2, $3, $4);
  `, [notif.type, notif.receiver, notif.sender, notif.created]
  );
};

authRouter.post('/', async (req, res) => {
  // Validate the request body
  if (!(req.body.notifications instanceof Array)) {
    return (
      res.status(400).json({
        message: 'Bad request'
      }).end()
    );
  }
  try {
    for (var i in req.body.notifications) {
      // Log a new notification
      await createNotif(req.body.notifications[i]);
    }
  } catch (err) {
    return (res.status(500).send({
      message: 'Internal Server Error'
    }));
  }
  return (res.status(204).end());
});

module.exports = authRouter;