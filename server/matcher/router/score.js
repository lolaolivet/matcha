const express = require('express');
const userExists = require('../common/user-exists');
const db = require('../common/db');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});

router.get('/', async (req, res) => {
  const userid = req.query.uid;

  // check for right parameter
  if (!userid) {
    return (
      res.status(400).send({
        message: 'Missing id',
        code: 400
      })
    );
  }
  try {
    const user = (await userExists.fn(userid));
    if (!user) {
      return res.status(404).send({
        message: 'User Not Found'
      });
    }
    // select computed score from db
    var score = (await db.query(`
      SELECT ROUND(AVG(score)::numeric, 2) as score 
      FROM user_info WHERE user_id = $1;
    `, [userid])).rows[0].score;
  } catch (error) {
    return (res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    }));
  }
  return (
    res.status(200).send(score)
  );
});

module.exports = router;
