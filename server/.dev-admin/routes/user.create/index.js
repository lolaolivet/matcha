const router = require('express').Router();
const createFakeUsers = require('./create-fake-users');
const { logPlace } = require('../../common/paw-functions');

router.get('/', async (req, res) => {
  var nbUser = req.query.n || 10;
  var place = req.query.placeid;
  try {
    const userids = await createFakeUsers(nbUser);
    if (place) {
      for (let i in userids) {
        await logPlace(userids[i], place);
      }
    }
    var message = `${nbUser} users were created${place ? ' in place nº' + place : ''}` + ' (/user.create)';
    res.status(200).send({
      message,
      userids
    });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

// // POST // //

const db = require('../..//db');

const changeGender = async (userid, gender) => {
  var result = await db.query(`
    UPDATE user_info
    SET gender=$2
    WHERE user_id=$1
  `, [userid, gender]);

  // If no insert, throw
  if (!result.rowCount) {
    throw (new Error('Nothing happend'));
  }
};

const blockUser = async (userid, blockedId, date = Date.now(), unblock = null) => {
  var result = await db.query(`
    INSERT INTO block_log
    (user_id, blocked_id, created, last_modified, unblocked)
    VALUES ($1, $2, $3, $4, $5)
  `, [userid, blockedId, date, unblock ? date : null, unblock]);

  // If no insert, throw
  if (!result.rowCount) {
    throw (new Error('Nothing happend'));
  }
};

const viewUser = async (userid, otherId, date = Date.now(), fullprofile = null) => {
  var result = await db.query(`
    INSERT INTO display_log
    (viewed_id, user_id, created, modified, fullprofile)
    VALUES ($1, $2, $3, $4, $5)
  `, [otherId, userid, date, fullprofile ? date : null, fullprofile]);

  // If no insert, throw
  if (!result.rowCount) {
    throw (new Error('Nothing happend'));
  }
};

const likeUser = async (senderId, receiverId, date = Date.now(), unliked = null) => {
  var result = await db.query(`
    INSERT INTO like_log
    (sender_id, receiver_id, created, modified, unliked)
    VALUES ($1, $2, $3, $4, $5)
  `, [senderId, receiverId, date, unliked ? date : null, unliked]);

  // If no insert, throw
  if (!result.rowCount) {
    throw (new Error('Nothing happend'));
  }
};

router.post('/', async (req, res) => {
  if (!req.body.users || !(req.body.users instanceof Array)) {
    return (res.status(400).end());
  }

  var nbUser = req.body.users.length;

  try {
    // validate all users;
    for (let i = 0; i < nbUser; i++) {
      let user = req.body.users[i];
      if (
        (user.place && // If place
          !user.place.id) || // must have place.id
        (user.gender && // If gender
          !(['male', 'female', 'other'].includes(user.gender))) || // must be one of male, female or other
        (user.view && // If view
          !user.view.userid) || // must have view.userid
        (user.block && // If block
          !user.block.userid) || // must have block.userid
        (user.like && // If like
          !user.like.userid) // must have like.userid
      ) {
        return (res.status(400).end());
      }
    }

    const userids = await createFakeUsers(nbUser);
    // Add all their options to the users
    for (let i in userids) {
      let user = req.body.users[i];

      if (user.place) {
        let place = user.place;
        await logPlace(userids[i], place.id, place.date);
      }
      if (user.gender) {
        let gender = user.gender;
        await changeGender(userids[i], gender);
      }
      if (user.block) {
        let block = user.block;
        await blockUser(userids[i], block.userid, block.date, block.unblock);
      }
      if (user.view) {
        let view = user.view;
        await viewUser(userids[i], view.userid, view.date, view.fullprofile);
      }
      if (user.like) {
        let like = user.like;
        await likeUser(userids[i], like.userid, like.date, like.unlike);
      }
    }
    var message = `${nbUser} users were created`;
    res.status(200).send({
      message,
      userids
    });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

module.exports = router;
