const db = require('./db');
const geolib = require('geolib');
const clientImageObject = require('./client-image-object');
const format = require('pg-format');

/**
  ProfileSummary:
    type: object
    properties:
      userid:
        $ref: '#/definitions/id'
      login:
        type: string
        pattern: (\w){1,15}$
      birthDate:
        $ref: '#/definitions/timestamp'
      gender:
        type: string
        enum: [male, female, other]
      picture:
        $ref: '#/definitions/Picture'
      lastIn:
        $ref: '#/definitions/timestamp'
      lastOut:
        $ref: '#/definitions/timestamp'
      # online or last log

  Picture:
    title: Picture
    type: object
    properties:
      id:
        $ref: '#/definitions/id'
      url:
        type: string
        pattern: ^\/static\/[0-9a-zA-Z]{6,}\.(jpg|jpeg|gif|JPG|png|PNG)$
      dateAdded:
        $ref: '#/definitions/timestamp'
      ownerID:
        $ref: '#/definitions/id'
    required:
      - id
      - url
      - dateAdded
      - ownerID
 */


const profileSummary = async (userid) => {
  if (userid === undefined) {
    throw (new Error('Missing argument userid'));
  }

  // Profile
  var profile = (await db.query(`
    SELECT
      user_auth.user_id,
      user_auth.user_login,
      user_info.gender,
      user_info.dob,
      user_info.last_in,
      user_info.last_out
    FROM user_auth
    INNER JOIN user_info
    ON user_auth.user_id = user_info.user_id
    WHERE user_auth.user_id = $1
  `, [userid])).rows[0] || {};

  // Translate to client keys
  profile = {
    userid: profile['user_id'],
    login: profile['user_login'],
    birthDate: profile['dob'] ? parseInt(profile['dob']) : null,
    gender: profile['gender'],
    lastIn: profile['last_in'] ? parseInt(profile['last_in']) : null,
    lastOut: profile['last_out'] ? parseInt(profile['last_out']) : null
  };
  // Picture
  profile.picture = (await db.query(`
    SELECT *
    FROM images
    WHERE owner_id=$1 AND main_pic
  `, [userid])).rows[0];

  if (profile.picture) {
    // Translate to client keys
    profile.picture = clientImageObject(profile.picture);
  }
  return (profile);
};

/**
 * NB : profileSummary and privateProfile are very similar
 *      but are seperate because they are expected to diverge more
 */
const privateProfile = async (userid) => {
  if (userid === undefined) {
    throw (new Error('Missing argument userid'));
  }

  // Profile
  var profile = (await db.query(`
    SELECT
      user_auth.user_id,
      user_auth.user_login,
      user_info.firstname,
      user_info.lastname,
      user_info.gender,
      user_info.dob,
      user_info.bio,
      user_auth.user_email,
      user_info.last_in,
      user_info.last_out
    FROM user_auth
    INNER JOIN user_info
    ON user_auth.user_id = user_info.user_id
    WHERE user_auth.user_id = $1
  `, [userid])).rows[0] || {};

  const location = (await db.query(
    `SELECT coordinates
      FROM location_log
      WHERE user_id = $1
      ORDER BY created DESC
      LIMIT 1`,
    [userid])).rows[0];

  // Translate to client keys
  profile = {
    userid: profile['user_id'],
    firstname: profile['firstname'],
    lastname: profile['lastname'],
    login: profile['user_login'],
    birthDate: profile['dob'] ? parseInt(profile['dob']) : null,
    gender: profile['gender'],
    email: profile['user_email'],
    bio: profile['bio'],
    lastIn: profile['last_in'] ? parseInt(profile['last_in']) : null,
    lastOut: profile['last_out'] ? parseInt(profile['last_out']) : null,
    location: location ? location['coordinates'] : {},
  };

  // Picture
  profile.picture = (await db.query(`
    SELECT *
    FROM images
    WHERE owner_id=$1 AND main_pic
  `, [userid])).rows[0];

  if (profile.picture) {
    // Translate to client keys
    profile.picture = clientImageObject(profile.picture);
  }
  return (profile);
};


/**
 * selectProfile
 * @param {Number} userid id of the user whose profile you want
 * @param {Number} id id of the user whose location is the reference for the value "distance"
 *
 * Selects the elements of a profile as expected by the front end
 * and translates the keynames from dbKeys to front-end-friendly keys
 */
const selectProfile = async (userid, id) => {
  if (!id) id = userid;
  const stmtProfile = `
    SELECT user_info.user_id,
    user_info.firstname,
    user_info.lastname,
    user_auth.user_login,
    user_auth.user_email,
    user_info.dob,
    user_info.gender,
    user_info.bio,
    user_info.last_in,
    user_info.last_out,
    user_info.created
    FROM user_info
    JOIN user_auth
    ON user_auth.user_id = user_info.user_id
    WHERE user_info.user_id = %L
  `;

  let requestProfile = format(stmtProfile, userid);
  let dbProfile = (await db.query(requestProfile)).rows[0];
  const stmtImg = `
      SELECT *
      FROM images
      WHERE owner_id = %L
    `;
  let requestImg = format(stmtImg, userid);
  let dbImgs = (await db.query(requestImg)).rows;

  // If no result, don't go further, return undefined
  if (!dbProfile) {
    return (undefined);
  }

  // select location of the demanded user
  const location = (await db.query(
    `SELECT coordinates
      FROM location_log
      WHERE user_id = $1
      ORDER BY created DESC
      LIMIT 1`,
    [userid])).rows[0];
  // select location of the demanding user
  const lastLocationUser2 = (await db.query(
    `SELECT coordinates
      FROM location_log
      WHERE user_id = $1
      ORDER BY created DESC
      LIMIT 1`,
    [id])).rows[0];
  // calcul difference
  const dist = (location && lastLocationUser2) ?
    (geolib.getDistance(lastLocationUser2.coordinates, location.coordinates) / 1000) :
    null;

  // null --> undefined
  Object.keys(dbProfile).map((key) => {
    if (dbProfile[key] === null) {
      dbProfile[key] = undefined;
    }
  });

  // Translate the keys from dbKeys to front-end-friendly keys
  let profile = {
    'userid': dbProfile['user_id'],
    'firstname': dbProfile['firstname'],
    'lastname': dbProfile['lastname'],
    'login': dbProfile['user_login'],
    'email': dbProfile['user_email'],
    'birthDate': dbProfile['dob'] !== undefined ? Number(dbProfile['dob']) : undefined,
    'gender': dbProfile['gender'],
    'bio': dbProfile['bio'] || '',
    'lastIn': dbProfile['last_in'] ? parseInt(dbProfile['last_in']) : null,
    'lastOut': dbProfile['last_out'] ? parseInt(dbProfile['last_out']) : null,
    'location': location ? location['coordinates'] : {},
    'distance': dist,
    'dateCreated': Number(dbProfile['created']),
    'pictures': dbImgs.map(clientImageObject),
    'password': '',
    'passwRepeat': ''
  };

  // Return the translated result
  return (profile);
};

async function checkProfileComplete (userid) {
  const stmtImg = `
      SELECT *
      FROM images
      WHERE owner_id = %L
    `;
  let requestImg = format(stmtImg, userid);
  let dbImgs = (await db.query(requestImg)).rows;
  const hasImages = dbImgs.length !== 0;

  const stmtProfile = `
    SELECT bio
    FROM user_info
    WHERE user_id = %L
  `;
  let requestProfile = format(stmtProfile, userid);
  let dbProfile = (await db.query(requestProfile)).rows[0];
  const hasBio = !!dbProfile['bio'];

  const stmtAuth = `
  SELECT confirmed
  FROM user_auth
  WHERE user_id = %L
  `;
  let requestAuth = format(stmtAuth, userid);
  let dbAuth = (await db.query(requestAuth)).rows[0];
  const isConfirmed = !!dbAuth['confirmed'];

  return (hasImages && hasBio && isConfirmed);
};

module.exports = {
  profileSummary,
  privateProfile,
  selectProfile,
  checkProfileComplete,
};
