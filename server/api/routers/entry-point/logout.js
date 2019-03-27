const express = require('express');
const db = require('../../common/db');
const userExists = require('../../common/user-exists');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});

router.post('/', async (req, res) => {
  const userid = req.body.userid;

  if (!userid) {
    return (
      res.status(400).json({
        message: 'Missing Parameter'
      })
    );
  }

  if (userid !== req.user.id) {
    return (
      res.status(403).send({
        message: 'Unauthorized (Restricted Action)',
        code: 403
      })
    );
  }

  try {
    const user = (await userExists.fn(userid));
    if (!user) {
      return (
        res.status(404).send({
          code: 404,
          message: 'user not found'
        })
      );
    }

    const userIp = req.connection.remoteAddress;

    // does not care about the corresponding login_log

    await db.query(
      `INSERT INTO logout_log
      (user_id, created, ip) VALUES
      ($1, $2, $3);
      `, [userid, Date.now(), userIp]
    );
  } catch (err) {
    console.error(err);
    return (res.status(500).send({
      message: 'Internal Server Error'
    }));
  }

  return (
    res.status(204).end()
  );
});

module.exports = router;
