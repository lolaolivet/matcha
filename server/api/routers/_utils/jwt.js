const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const userExists = require('../../common/user-exists');
const jwt = require('jsonwebtoken');
const secret = process.env.MATCHA_SECRET;

const newJWT = (userid, sessionId) => {
  const opts = {
    expiresIn: 60 * 60 * 24 * 4 // 4 days
  };
  const payload = {
    id: userid,
    jti: sessionId
  };
  return (jwt.sign(payload, secret, opts));
};

const headerStrategy = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret
};

const cookieExtractor = (req) => {
  var token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  return token;
};

const cookieStrategy = {
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: secret
};

const strategyHandler = async (jwtPayload, done) => {
  if (await userExists.id(jwtPayload.id)) {
    return done(null, jwtPayload);
  }
  return done(null, false);
};

const jwtHeaderStrategy = new JwtStrategy(headerStrategy, strategyHandler);
const jwtCookieStrategy = new JwtStrategy(cookieStrategy, strategyHandler);

module.exports = {
  jwtHeaderStrategy,
  jwtCookieStrategy,
  newJWT
};
