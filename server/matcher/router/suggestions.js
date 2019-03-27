const express = require('express');
const router = express.Router({
  mergeParams: true // inherit params from earlier router
});
const db = require('../common/db');
const userExists = require('../common/user-exists');
const useridToProfileSummary = require('../common/userid-to').profileSummary;
const useridToProfile = require('../common/userid-to').selectProfile;
const checkProfileComplete = require('../common/userid-to').checkProfileComplete;
const { ageFromDob } = require('../common/date-of-birth');
const geolib = require('geolib');
const shuffleArray = require('../common/shuffle-array');
const {
  selectLastPlace,
  selectLastAttitude,
  selectLastWeapon,
  placeToClientKeys,
  attitudeToClientKeys,
  weaponToClientKeys
} = require('../common/paw-functions');

const TWO_WEEKS = 1.21e+9;

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

const selectMaxDist = async (userid) => {
  var userMaxDist = (
    await db.query(`
      SELECT distance_max
      FROM user_preferences
      WHERE user_id = $1
      `, [userid])
  ).rows[0].distance_max;

  return (userMaxDist);
};

const selectAgeInterval = async (userid) => {
  var agePref = (
    await db.query(`
      SELECT age_min, age_max
      FROM user_preferences
      WHERE user_id = $1
      `, [userid])
  ).rows[0];

  return (agePref);
};

const selectScoreInterval = async (userid) => {
  var scorePref = (
    await db.query(`
      SELECT score_min, score_max
      FROM user_preferences
      WHERE user_id = $1
      `, [userid])
  ).rows[0];

  return (scorePref);
};

const selectUserLoc = async (userid) => {
  var result = (
    await db.query(`
      SELECT coordinates
      FROM location_log
      WHERE user_id = $1
      ORDER BY created DESC
      LIMIT 1
      `, [userid])
  ).rows;

  const location = result[0].coordinates;

  return (location);
};

/*
  NB : Incomplete user profiles are filtered first through p.a.w. (pas de p.a.w. pas de chocol.a.w.) (actually only p : place)
    Then if the user tricks us into setting p.a.w. before filling profile, user is filtered again through
    image count, bio and confirmed (even though no confirm === no jwt === no access to api === no way to add paw)
*/
const extractNPeopleExcept = async (exceptIds, n, userid, filters) => {
  /* DO NOT REMOVE */ // console.log(`-- asking for ${n}`);
  const { gender, lookfor, placeId } = filters;
  if (!gender || !lookfor || !placeId) {
    throw new Error('Cannot perform query');
  }

  var exeptParams = exceptIds.map((_, index) => `$${index + 3}`);
  var exceptQueryArr = exeptParams.join(',');
  var people =
    (
      await db.query(
        `
          -- select user_id, last_in, last_viewed and last_liked
          --  user_id : user 2
          --  last_in : time user 2 was logged in the place
          --  last_viewed : last time user 2 saw user 1
          --  last_liked : last time user 2 liked user 1
          SELECT
            place_log.user_id AS user_id,
            MAX(place_log.created) AS last_in,
            MAX(display_log.created) AS last_viewed,
            MAX(like_log.created) AS last_liked,
            MAX(user_info.dob) AS born,
            MAX(user_info.score) AS score
          FROM place_log
          JOIN user_preferences
            ON user_preferences.user_id = place_log.user_id
          JOIN user_info
            ON user_info.user_id = place_log.user_id
          LEFT JOIN display_log
            ON display_log.viewed_id = place_log.user_id AND display_log.user_id = $2
          LEFT JOIN like_log
            ON like_log.receiver_id = place_log.user_id AND like_log.sender_id = $2
          WHERE
            place_log.place_id = $1
            AND
            place_log.latest
            AND
            user_preferences.looking_for_${gender}=TRUE
            AND
            user_info.gender IN (${lookfor})
            AND
            place_log.user_id NOT IN (
              SELECT blocked_id
              FROM block_log
              WHERE user_id=$2 AND unblocked IS NULL
            )
            AND
            place_log.user_id NOT IN (
              SELECT user_id
              FROM block_log
              WHERE blocked_id=$2 AND unblocked IS NULL
            )
            AND
            place_log.user_id NOT IN (
              SELECT user_1
              FROM match_log
              WHERE user_2=$2 AND unmatched IS NULL
            )
            AND
            place_log.user_id NOT IN (
              SELECT user_2
              FROM match_log
              WHERE user_1=$2 AND unmatched IS NULL
            )
            AND place_log.user_id <> $2
            ${exceptQueryArr ? 'AND place_log.user_id NOT IN (' + exceptQueryArr + ')' : ''}
          GROUP BY place_log.user_id
          LIMIT ${n}
        `,
        [
          placeId, // $1
          userid, // $2
          ...exceptIds
        ]
      )
    ).rows || [];
  /* DO NOT REMOVE */ // console.log('-- yielded', people.length);
  const considered = people.map(p => p['user_id']).concat(exceptIds);
  /* DO NOT REMOVE */ // console.log(`considered ${considered.length} so far`);

  if (people.length === 0) {
    /* DO NOT REMOVE */ // console.log('-- no more');
    return (people);
  }

  for (let i in people) {
    const person = people[i];
    // Fill paw
    const p = placeToClientKeys(
      await selectLastPlace(person['user_id'])
    );
    const a = attitudeToClientKeys(
      await selectLastAttitude(person['user_id'])
    );
    const w = weaponToClientKeys(
      await selectLastWeapon(person['user_id'])
    );
    const paw = {
      place: p,
      attitude: a,
      weapon: w
    };
    person.paw = paw;
    // Fill location
    const coord = await selectUserLoc(person['user_id']);
    person.location = coord;
    const complete = await checkProfileComplete(person['user_id']);
    person.complete = complete;
  }

  const userLoc = await selectUserLoc(userid);

  const maxDist = await selectMaxDist(userid);
  // selon age
  const agePref = await selectAgeInterval(userid);
  // selon score
  const scorePref = await selectScoreInterval(userid);

  people =
    people.filter(p => {
      let now = Date.now();
      let twoWeeksAgo = now - TWO_WEEKS;
      let lastView = p['last_viewed'];
      let lastLike = p['last_liked'];
      let lastLocation = p.location;
      const dist = (geolib.getDistance(lastLocation, userLoc) / 1000);
      // Mutate object on the fly
      p.distance = dist;
      const age = ageFromDob(p['born']);
      const score = p['score'];

      const pass =
        p.complete &&
        (!filters.age || (age >= agePref['age_min'] && age <= agePref['age_max'])) &&
        (!filters.score || (score > scorePref['score_min'] && score < scorePref['score_max'])) &&
        (!filters.dist || dist < maxDist) &&
        (!filters.view || lastView === null || lastView <= twoWeeksAgo) &&
        (!filters.like || lastLike === null || lastLike <= twoWeeksAgo);

      /* DO NOT REMOVE */
      // console.log(
      //   (!filters.age || (age >= agePref['age_min'] && age <= agePref['age_max']))
      //   ? (!filters.score || (score > scorePref['score_min'] && score < scorePref['score_max']))
      //     ? (!filters.dist || dist < maxDist)
      //       ? (!filters.view || lastView === null || lastView <= twoWeeksAgo)
      //         ? (!filters.like || lastLike === null || lastLike <= twoWeeksAgo)
      //           ? 'no filter'
      //           : 'has liked'
      //         : 'has viewed'
      //       : 'too far'
      //     : 'not in my league'
      //   : 'too old'
      // );

      return (pass);
    });

  if (people.length < n) {
    /* DO NOT REMOVE */ // console.log('-- filtered ' + (n - people.length) + ' asking for more');
    return (people.concat(await extractNPeopleExcept(considered, n - people.length, userid, filters)));
  }
  /* DO NOT REMOVE */ // console.log(`-- exact count (${n})`);
  return (people);
};

const listOfSuggestions = async (userid, n, exceptIds, filters) => {
  // Otherwise
  // Get latest room
  var place = await selectLastPlace(userid);
  // Lookfor
  var lookfor = await selectLookFor(userid);
  let commaM = lookfor['male'] && (lookfor['female'] || lookfor['other']);
  let commaF = lookfor['female'] && lookfor['other'];
  lookfor =
  (lookfor['male'] ? '\'male\'' : '') +
  (commaM ? ',' : '') +
  (lookfor['female'] ? '\'female\'' : '') +
  (commaF ? ',' : '') +
  (lookfor['other'] ? '\'other\'' : '');
  // gender
  var gender = await selectGender(userid);
  // place
  var placeId = place['place_id'] || 1;

  filters = {
    ...filters,
    gender,
    lookfor,
    placeId
  };
  // Get a bunch of people with the right attributes
  var people = await extractNPeopleExcept(exceptIds, n, userid, filters);

  // Clean the output
  people =
    people.map(p => {
      // replace user_id by userid
      p.userid = p['user_id'];
      delete p['user_id'];

      // replace last_in by lastIn
      p.lastIn = parseInt(p['last_in']);
      delete p['last_in'];

      // if last_viewed replace it with lastViewed, or just delete it
      if (p['last_viewed']) {
        p.lastViewed = parseInt(p['last_viewed']);
      }
      delete p['last_viewed'];

      // if last_liked replace it with lastLiked, or just delete it
      if (p['last_liked']) {
        p.lastLiked = parseInt(p['last_liked']);
      }
      delete p['last_liked'];

      return (p);
    });

  // Add a profile summary to each
  for (let i in people) {
    people[i].profileSummary = await useridToProfileSummary(people[i].userid);
    people[i].profile = await useridToProfile(people[i].userid);
    delete people[i].profile.location;
    delete people[i].profile.password;
    delete people[i].profile.passwordRepeat;
  }

  return (people);
};

router.get('/', async (req, res) => {
  var userid = req.query.uid;
  // If not uid in query --> 400
  if (userid === undefined) {
    return (
      res.status(400).send({
        message: 'Bad Request',
        code: 400
      })
    );
  }

  // Only you can get your own matches
  if (req.user.id !== parseInt(userid)) {
    return (
      res.status(403).send({
        message: 'Unauthorized',
        code: 403
      })
    );
  }

  try {
    // If user does not exist --> 404
    if (!(await userExists.fn(userid))) {
      return (
        res.status(404).send({
          message: 'User Not Found',
          code: 404
        })
      );
    }

    var exceptIds = req.query.except || '[]';
    var n = parseInt(req.query.n) || 30;
    try {
      exceptIds = JSON.parse(exceptIds);
    } catch (error) {
      exceptIds = [];
    }

    var filters = {
      view: req.query.filterView === 'true',
      like: req.query.filterLike === 'true',
      dist: req.query.filterDist === 'true',
      age: req.query.filterAge === 'true',
      score: req.query.filterScore === 'true'
    };
    const people = shuffleArray(await listOfSuggestions(userid, n, exceptIds, filters));

    return (res.status(200).send(people));
  } catch (error) {
    console.error(error);
    return (
      res.status(500).send({
        message: 'Internal Server Error',
        code: 500
      })
    );
  }
});

module.exports = router;
