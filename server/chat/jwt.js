const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require('./db');
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.MATCHA_SECRET;

async function userExists ({
  email,
  login,
  id
}) {
  try {
    const ret = await db.query(
      `
        SELECT *
        FROM user_auth
        WHERE user_id = $1 and user_login = $2 and user_email = $3
      `, [id, login, email]);
    return (ret.rowCount === 1);
  } catch (error) {
    return false;
  }
}

module.exports = new JwtStrategy(opts, async (jwtPayload, done) => {
  if (await userExists(jwtPayload)) {
    return done(null, jwtPayload);
  }
  return done(null, false);
});
