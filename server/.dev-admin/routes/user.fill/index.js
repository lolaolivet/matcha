const router = require('express').Router();
const createFakeUsers = require('../user.create/create-fake-users');
const { logPlace, logWeapon, logAttitude } = require('../../common/paw-functions');
const db = require('../../db');
const { updateAllScores } = require('../../common/compute_score');
const locations = require('../../common/locations');
const lorem = require('../../common/bio');

const randomNb = (nbMax, nbMin = 0) => {
  return (Math.floor(Math.random() * ((nbMax + 1) - nbMin)) + nbMin);
};

const blockUser = async (userid, blockedId, unblock = null) => {
  // refresh logs
  await db.query(
    `UPDATE block_log
    SET latest = 'f'
    WHERE user_id = $1 AND blocked_id = $2;`,
    [userid, blockedId]
  );
  // perform block
  var result = await db.query(
    `INSERT INTO block_log
    (user_id, blocked_id, created, last_modified, unblocked, latest)
    VALUES ($1, $2, $3, $4, $5, TRUE);`,
    [userid, blockedId,  Date.now(), unblock ? Date.now() : null, unblock]
  );
  // If no insert, throw
  if (!result.rowCount) {
    throw (new Error('Nothing happend'));
  }
};

const unblockUser = async (userid, blockedId, date = Date.now()) => {
  var result = await db.query(
    ` UPDATE block_log
    SET unblocked=true, last_modified=$3
    WHERE
    user_id = $1
    AND blocked_id = $2
    AND latest`,
    [userid, blockedId, date]
  );

  // If no insert, throw
  if (!result.rowCount) {
    throw (new Error('Nothing happend'));
  }
};

const viewUser = async (userid, otherId, date = Date.now(), fullprofile = null) => {
 // refresh logs
 await db.query(
  `UPDATE display_log
  SET latest = 'f'
  WHERE user_id = $1 AND viewed_id = $2;`,
  [userid, otherId]
);
// perform view log
var result = await db.query(
  `INSERT INTO display_log
  (user_id, viewed_id, created, modified, fullprofile, latest)
  VALUES ($1, $2, $3, $4, $5, TRUE);`,
  [userid, otherId, date, fullprofile ? date : null, fullprofile]
);

  // If no insert, throw
  if (!result.rowCount) {
    throw (new Error('Nothing happend'));
  }
};

const likeUser = async (senderId, receiverId, date = Date.now(), unliked = null) => {
  // refresh logs
  await db.query(
    `UPDATE like_log
    SET latest = 'f'
    WHERE sender_id = $1 AND receiver_id = $2;`,
    [senderId, receiverId]
  );
  // Perform like
  var result = await db.query(
    `INSERT INTO like_log
      (sender_id, receiver_id, created, modified, unliked, latest)
      VALUES ($1, $2, $3, $4, $5, TRUE)`,
    [senderId, receiverId, date, unliked ? date : null, unliked]
  );
  // If no insert, throw
  if (!result.rowCount) {
    throw (new Error('Nothing happend'));
  }
};

const matchUsers = async (senderId, receiverId, date = Date.now(), unliked) => {
  // Check other also liked
  var likedBack = (await db.query(
    `SELECT unliked FROM like_log WHERE sender_id=$1
    AND receiver_id=$2 AND latest`,
     [receiverId, senderId])).rows[0];
  if (likedBack !== undefined && !likedBack.unliked) {
    var matchExists = (await db.query(
      `SELECT unmatched FROM match_log
      WHERE ((user_1=$1 AND user_2=$2)
      OR (user_1=$2 AND user_2=$1))
      AND latest`,
       [receiverId, senderId])).rows[0];
    if (matchExists === undefined || matchExists.unmatched) {
      // If liked and not unliked --> match
      var result = await db.query(
        `INSERT INTO match_log
        (user_1, user_2, created, latest)
        VALUES ($1, $2, $3, TRUE)`,
        [receiverId, senderId, date] // First user to like is user_1
      );
      // If no insert, throw
      if (!result.rowCount) {
        throw (new Error('Nothing happend'));
      }
    }
  }
  if (unliked) {
    // Unmatch if needed
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
      [senderId, receiverId, date]
    );
  }
};

const createPAW = async (userid, nbLog) => {
  if (nbLog >= 1) {
    for (let i = 0; i < nbLog; i++) {
      await logPlace(userid, randomNb(4, 1));
      await logAttitude(userid, randomNb(4, 1));
      await logWeapon(userid, randomNb(4, 1));
    }
  }
};

const viewLikeMatch = async (nbLikes, suggId, userid) => {
  for (let i = 0; i < nbLikes;) {
    let receiverId = suggId.map(s => s.user_id);
    let like = receiverId[randomNb(receiverId.length - 1)];
    if (like !== userid) {
      await viewUser(userid, like);
      await likeUser(userid, like);
      await matchUsers(userid, like);
      i++;
    }
  }
};

const viewBlock = async (nbBlocks, suggId, userid) => {
  for (let i = 0; i < nbBlocks; i++) {
    let receiverId = suggId.map(s => s.user_id);
    let block = receiverId[randomNb(receiverId.length - 1)];
    if (block !== userid) {
      await viewUser(userid, block);
      await blockUser(userid, block);
      if (Math.random() < .05) {
        await unblockUser(userid, block);
      }
    }
  }
};

const createLogout = async (userid, date = Date.now()) => {
  var result = await db.query(`
    INSERT INTO logout_log
    (user_id, created)
    VALUES ($1, $2);
  `, [userid, date]);

  // If no insert, throw
  if (!result.rowCount) {
    throw (new Error('Nothing happend'));
  }
};

const selectLookFor = async (userid) => {
  var lookfor = (
    await db.query(`
      SELECT
        looking_for_female AS female,
        looking_for_male AS male,
        looking_for_other AS other
      FROM user_preferences
      WHERE user_id = $1
    `, [userid])
  ).rows[0];

  return (lookfor);
};

const selectGender = async (userid) => {
  var gender = (
    await db.query(`
      SELECT gender
      FROM user_info
      WHERE user_id = $1
    `, [userid])
  ).rows[0].gender;

  return (gender);
};

const createPref = async (userid) => {
  let lookMale = Math.random() < 0.5;
  let lookFemale = Math.random() < 0.5;
  let lookOther = Math.random() < 0.5;
  // If false everywhere put male by default
  if (lookMale === false && lookFemale === false && lookOther === false) {
    lookOther = true;
  }

  // Between 18 and 80 for a maximum range exemple
  let ageMax = 80;
  let ageMin = 18;
  // Between 0 and 100 for a maximum range exemple
  let scoreMax = 100;
  let scoreMin = 0;
  // Between 1 and 50 for a maximum range exemple
  let distMax = randomNb(50, 1);
  var result = await db.query(`
    UPDATE user_preferences
    SET
      looking_for_male = $2,
      looking_for_female = $3,
      looking_for_other = $4,
      age_max = $5,
      age_min = $6,
      score_max = $7,
      score_min = $8,
      distance_max = $9
    WHERE user_id = $1
    `, [userid, lookMale, lookFemale, lookOther, ageMax, ageMin, scoreMax, scoreMin, distMax]);
  // If no insert, throw
  if (!result.rowCount) {
    throw (new Error('Nothing happend'));
  }
};

const selectPeople = async (userGender, lookfor) => {
  let commaM = lookfor['male'] && (lookfor['female'] || lookfor['other']);
  let commaF = lookfor['female'] && lookfor['other'];
  lookfor =
    (lookfor['male'] ? '\'male\'' : '') +
    (commaM ? ',' : '') +
    (lookfor['female'] ? '\'female\'' : '') +
    (commaF ? ',' : '') +
    (lookfor['other'] ? '\'other\'' : '');
  var people = (await db.query(`
    SELECT user_info.user_id
    FROM user_info
    JOIN user_preferences
    ON user_info.user_id = user_preferences.user_id
    WHERE gender IN (${lookfor})
    AND user_preferences.looking_for_${userGender} = true;
    `)).rows || [];
  return (people);
};

const logLocation = async (userid) => {
  let loc = locations[randomNb(locations.length - 1)];
  const location = JSON.stringify({
    latitude: loc.latitude,
    longitude: loc.longitude
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

const biography = async (userid) => {
  let bio = lorem[randomNb(lorem.length - 1)];
  var result = await db.query(`
    UPDATE user_info
    SET bio = $2
    WHERE user_id = $1
  `, [userid, bio]);

  // If no insert, throw
  if (!result.rowCount) {
    throw (new Error('Nothing happend'));
  }
};

router.get('/', async (req, res) => {
  const nbUsers = req.query.n || 10;
  const nbLikes = req.query.likes || 2;
  const nbBlocks = req.query.blocks || 2;
  console.log(`Requested for creation of ${nbUsers} fake users with ${nbLikes} likes and ${nbBlocks} blocks each.` + ' (/user.fill)');

  try {
    let userids = await createFakeUsers(nbUsers);
    for (let i in userids) {
      await createPAW(userids[i], 3);
      await createPref(userids[i]);
      await logLocation(userids[i]);
      await biography(userids[i]);
    }
    for (let i in userids) {
      let gender = await selectGender(userids[i]);
      let lookfor = await selectLookFor(userids[i]);
      let suggestions = await selectPeople(gender, lookfor);
      if (suggestions.length !== 0) {
        await viewLikeMatch(nbLikes, suggestions, userids[i]);
        await viewBlock(nbBlocks, suggestions, userids[i]);
      }
      await createLogout(userids[i]);
    }
    await updateAllScores();
    console.log(`${nbUsers} users were created with ${nbLikes} likes and ${nbBlocks} blocks each.` + ' (/user.fill)');
    return (res.status(200).end());
  } catch (error) {
    console.log(error);
    return (res.status(500).send());
  }
});

module.exports = router;
