const db = require('../../common/db');
const uuid = require('uuid/v1');

const getEmailAdress = async (userid) => {
  const req = await db.query('SELECT user_email FROM user_auth WHERE user_id = $1', [userid]);
  return (req.rows[0]);
};

const isEmailTaken = async (email) => {
  const result = await db.query(`
      SELECT user_email
      FROM user_auth
      WHERE user_email = $1
    `, [email]);
  return (result.rowCount !== 0);
};

const isNewEmailSet = async (userid) => {
  const result = await db.query(`
    SELECT *
    FROM user_auth
    WHERE user_id = $1 AND new_email IS NOT NULL
    `, [userid]);
  return (result.rowCount !== 0);
};

const isLoginTaken = async (login) => {
  const result = await db.query(`
      SELECT user_id
      FROM user_auth
      WHERE LOWER(user_login) = LOWER($1)
    `, [login]
  );
  return (result.rowCount !== 0);
};

const createMailToken = (hours) => ({
  uuid: uuid(),
  exp: Date.now() + hours * (60 * 60 * 1000)
});

const updateMailToken = async (userid, token) => {
  const ret = await db.query(`
      UPDATE user_auth
      SET token_mail=$1
      WHERE user_id=$2
    `, [JSON.stringify(token), userid]);
  return (ret.rowCount === 1);
};

const updatePwdToken = async (userid, token) => {
  const ret = await db.query(`
      UPDATE user_auth
      SET token_pwd=$1
      WHERE user_id=$2
    `, [JSON.stringify(token), userid]);
  return (ret.rowCount === 1);
};

const register = async (email, login, passwordHash, tokenMail) => {
  // Create the user in user_auth
  const userid = (
    await db.query(`
      INSERT INTO user_auth(user_email, user_login, user_password, token_mail)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id AS userid
    `, [email, login, passwordHash, JSON.stringify(tokenMail)])
  ).rows[0]['userid'];
  // return userid
  return (userid);
};

const getMailToken = async (id) => {
  var token = (
    await db.query(`
      SELECT token_mail
      FROM user_auth
      WHERE user_id = $1
    `, [id])
  ).rows[0]['token_mail'];
  return (JSON.parse(token));
};

const getPwdToken = async (id) => {
  var token = (
    await db.query(`
      SELECT token_pwd
      FROM user_auth
      WHERE user_id = $1
    `, [id])
  ).rows[0]['token_pwd'];
  return (JSON.parse(token));
};

const confirm = async (id) => {
  var ok = (await db.query(`
    UPDATE user_auth
    SET confirmed = TRUE
    WHERE user_id = $1
  `, [id])).rowCount === 1;
  return (ok);
};

const confirmEmail = async (id) => {
  const email = (await db.query(`
    SELECT new_email
    FROM user_auth
    WHERE user_id = $1
  `, [id])).rows[0].new_email;

  var ok = (await db.query(`
    UPDATE user_auth
    SET user_email = $1
    WHERE user_id = $2
  `, [email, id])).rowCount === 1;
  return (ok);
};

const checkConfirm = async (id) => {
  var ok = (await db.query(`
    SELECT confirmed
    FROM user_auth
    WHERE user_id = $1
    `, [id])).rows[0].confirmed === true;
  return (ok);
};

const updatePassword = async (id, hashPwd) => {
  var ok = (await db.query(`
    UPDATE user_auth
    SET user_password = $2
    WHERE user_id = $1
  `, [id, hashPwd])).rowCount;
  return (ok === 1);
};

const createProfile = (user) => {
  return (
    db.query(`
      INSERT INTO user_info
      (user_id, firstname, lastname, gender, dob, score, created)
      VALUES($1, $2, $3, $4, $5, $6, $7)
    `, [user.userid, user.firstname, user.lastname, user.gender, user.dob, 50.0, Date.now()])
  );
};

const logDefaultPosition = async (userid) => {
  // default values for localhost = copacabana
  const coord = {
    latitude: '-22.9773065',
    longitude: '-43.1898984',
  };

  return db.query(
    `INSERT INTO location_log
      (user_id, coordinates, created)
      VALUES ($1, $2, $3)`,
    [userid, coord, Date.now()]
  );
};

const createPreference = (user) => {
  return (
    db.query(`
      INSERT INTO user_preferences
      (user_id, age_max, age_min, score_max, score_min, distance_max)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [user.userid, user.ageMax, user.ageMin, user.scoreMax, user.scoreMin, user.distance])
  );
};

const logSession = async (userid, ip) => {
  var sessionId = (await db.query(`
      INSERT INTO login_log (user_id, ip, created)
      VALUES($1, $2, $3) RETURNING session_id
    `, [userid, ip, Date.now()])).rows[0]['session_id'];
  return sessionId;
};

const getUserBy = {
  login: async (login) => {
    let user = await db.query(`
      SELECT *
      FROM user_auth
      WHERE LOWER(user_login) = LOWER($1)`,
    [login]);

    return (user.rows[0]);
  },
  email: async (email) => {
    let user = await db.query(`
      SELECT *
      FROM user_auth
      WHERE user_email = $1`,
    [email]);

    return (user.rows[0]);
  }
};

const verifyPassword = async (userid) => {
  let password = (await db.query(`
    SELECT user_password
    FROM user_auth
    WHERE user_id = $1`,
  [userid])
  ).rows[0]['user_password'];
  return (password);
};

module.exports = {
  getEmailAdress,
  getUserBy,
  register,
  createProfile,
  createPreference,
  isEmailTaken,
  isLoginTaken,
  confirm,
  confirmEmail,
  checkConfirm,
  createMailToken,
  getMailToken,
  getPwdToken,
  updateMailToken,
  updatePwdToken,
  updatePassword,
  logSession,
  verifyPassword,
  isNewEmailSet,
  logDefaultPosition,
};
