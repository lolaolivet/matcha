const router = require('express').Router();
const userExists = require('../../common/user-exists');
const db = require('../..//db');
const {
  logPlace,
  logWeapon,
  logAttitude,
} = require('../../common/paw-functions');



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

/**
 * logLocation
 * @params : userid, lat, long
 */
const logLocation = async (userid, lat, long) => {
  const location = JSON.stringify({
    latitude: lat,
    longitude: long
  });

  var result = await db.query(`
    INSERT INTO location_log
    (coordinates, user_id, created)
    VALUES ($2, $1, $3)
  `, [userid, location, Date.now()]);

  // If no insert, throw
  if (!result.rowCount) {
    throw (new Error('Nothing happend'));
  }
};

const changeLookingFor = async (userid, lookingFor = {}) => {
  var result = await db.query(`
    UPDATE user_preferences
    SET
      looking_for_male = $2,
      looking_for_female = $3,
      looking_for_other = $4
    WHERE user_id=$1
  `, [userid, !!lookingFor.male, !!lookingFor.female, !!lookingFor.other]);

  // If no insert, throw
  if (!result.rowCount) {
    throw (new Error('Nothing happend'));
  }
};

const changeDist = async (userid, distMax) => {
  var result = await db.query(`
    UPDATE user_preferences
    SET
      distance_max = $2
    WHERE user_id=$1
  `, [userid, distMax]);

  // If no insert, throw
  if (!result.rowCount) {
    throw (new Error('Nothing happend'));
  }
};

const blockUser = async (userid, blockedId, unblock = null) => {
  var result = await db.query(`
    INSERT INTO block_log
    (user_id, blocked_id, created, last_modified, unblocked)
    VALUES ($1, $2, $3, $4, $5)
  `, [userid, blockedId, Date.now(), unblock ? Date.now() : null, unblock]);

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

const matchUsers = async (senderId, receiverId, date = Date.now(), unliked) => {
  // Check other also liked
  var likedBack = (await db.query('SELECT unliked FROM like_log WHERE sender_id=$1 AND receiver_id=$2 ORDER BY created DESC LIMIT 1', [receiverId, senderId])).rows[0];
  if (likedBack !== undefined && !likedBack.unliked) {
    // If liked and not unliked --> match
    var result = await db.query(
      `INSERT INTO match_log
      (user_1, user_2, created)
      VALUES ($1, $2, $3)`,
      [receiverId, senderId, date] // First user to like is user_1
    );
    // If no insert, throw
    if (!result.rowCount) {
      throw (new Error('Nothing happend'));
    }
  }
  if (unliked) {
    // Unmatch if needed
    await db.query(
      `WITH last_log AS (
        SELECT * FROM match_log
        WHERE
          (
            (user_1 = $1 AND user_2 = $2)
            OR
            (user_1 = $2 AND user_2 = $1)
          )
          AND
          unmatched IS NULL
        ORDER BY created
        LIMIT 1
      )
      UPDATE match_log
        SET unmatched=true, modified=$3
      FROM last_log
      WHERE match_log.created = last_log.created
      `,
      [senderId, receiverId, date]
    );
  }
};

router.post('/', async (req, res) => {
  if (!req.body.users || !(req.body.users instanceof Array)) {
    return (res.status(400).end());
  }

  var users = req.body.users;
  var nbUser = users.length;

  const validModifArray = async (arr) => {
    var acc = true;
    for (let i in arr) {
      acc =
        acc &&
        arr[i].userid && // must have view.userid
        await userExists.fn(arr[i].userid); // user for view.userid must exists
      if (!acc) break; // stop as soon as acc is false
    }
    return acc;
  };

  try {
    // validate all users;
    for (let i = 0; i < nbUser; i++) {
      let user = req.body.users[i];
      if (
        !(user.userid) || // Must have userid
        !(await userExists.fn(user.userid)) || // User must exist
        (user.place && // If place
          !user.place.id) || // must have place.id
        (user.weapon && // If weapon
          !user.weapon.id) || // must have weapon.id
        (user.attitude && // If attitude
          !user.attitude.id) || // must have attitude.id
        (user.gender && // If gender
          !(['male', 'female', 'other'].includes(user.gender))) || // must be one of male, female or other
        (user.views && // If views
          !await validModifArray(user.views)) ||
        (user.blocks && // If blocks
          !await validModifArray(user.blocks)) ||
        (user.likes && // If likes
          !await validModifArray(user.likes)) ||
        (user.location && // If location
          (user.location.lat === undefined || user.location.long === undefined))
      ) {
        return (res.status(400).end());
      }
    }

    // Add all their options to the users
    for (let i = 0; i < nbUser; i++) {
      let user = users[i];

      if (user.place) {
        let place = user.place;
        await logPlace(user.userid, place.id, place.date);
      }
      if (user.weapon) {
        let weapon = user.weapon;
        await logWeapon(user.userid, weapon.id, weapon.date);
      }
      if (user.attitude) {
        let attitude = user.attitude;
        await logAttitude(user.userid, attitude.id, attitude.date);
      }
      if (user.gender) {
        let gender = user.gender;
        await changeGender(user.userid, gender);
      }
      if (user.lookfor) {
        await changeLookingFor(user.userid, user.lookfor);
      }
      if (user.blocks) {
        let blocks = user.blocks;
        for (let n in blocks) {
          let block = blocks[n];
          await blockUser(user.userid, block.userid, block.unblocked);
        }
      }
      if (user.views) {
        let views = user.views;
        for (let n in views) {
          let view = views[n];
          await viewUser(user.userid, view.userid, view.date, view.fullprofile);
        }
      }
      if (user.likes) {
        let likes = user.likes;
        for (let n in likes) {
          let like = likes[n];
          await likeUser(user.userid, like.userid, like.date, like.unliked);
          await matchUsers(user.userid, like.userid, like.date, like.unliked);
        }
      }
      if (user.location) {
        let { lat, long } = user.location;
        await logLocation(user.userid, lat, long);
      }
      if (user.distMax) {
        await changeDist(user.userid, user.distMax);
      }
    }
    var message = `${nbUser} users were modified` + ' (/user.edit)';
    res.status(200).send({
      message
    });
    console.log(message);
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

module.exports = router;
