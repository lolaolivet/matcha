const express = require('express');
const db = require('../common/db');
const userExists = require('../common/user-exists');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});

const lastLogToTime = (timestamp) => {
  let date = new Date();
  date.setTime(timestamp);

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let min = date.getMinutes();

  month = (month < 10 ? '0' : '') + month;
  day = (day < 10 ? '0' : '') + day;
  hour = (hour < 10 ? '0' : '') + hour;
  min = (min < 10 ? '0' : '') + min;

  return (
    `${day}/${month}/${year} at ${hour}:${min}`
  );
};

router.get('/', async (req, res) => {
  const userid = req.query.uid;
  if (!userid) {
    return (
      res.status(400).send({
        message: 'Bad Request: Missing id'
      })
    );
  }

  try {
    // test in user Exists
    if (!(await userExists.fn(userid))) {
      return (
        res.status(404).send({
          message: 'User Not Found',
          code: 404
        })
      );
    }

    // get the last log time
    const timestamp = (await db.query(
      `SELECT MAX(created) FROM logout_log
      WHERE user_id = $1;`, [userid]
    )).rows[0].max;

    // convert it into a human readable string
    var date;
    if (timestamp) {
      date = await lastLogToTime(timestamp);
    } else {
      date = 'never, yet';
    }
  } catch (err) {
    return (
      res.status(500).send({
        message: 'Server Error'
      })
    );
  }

  return (
    res.status(200).send({
      time: date
    })
  );
});

module.exports = router;
