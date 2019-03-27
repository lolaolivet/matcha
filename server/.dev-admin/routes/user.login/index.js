const authRouter = require('express-promise-router')();
const db = require('../..//db');
const jwt = require('jsonwebtoken');

function generateJWT (payload) {
  const opts = {};
  opts.expiresIn = 60 * 60 * 12; // 12 hours
  const secret = process.env.MATCHA_SECRET;
  return jwt.sign(payload, secret, opts);
}

const newAuth = async (userid, sessionId) => {
  return {
    jwt: generateJWT({
      id: userid,
      jti: sessionId
    })
  };
};

const loginLog = async (userid, ip) => {
  var sessionId = (await db.query(`
      INSERT INTO login_log (user_id, ip, created)
      VALUES($1, $2, $3) RETURNING session_id
    `, [userid, ip, Date.now()])).rows[0]['session_id'];
  return sessionId;
};

const login = async (userid, clientIp) => {
  // Save login activity (login_log)
  var sessionId = await loginLog(userid, clientIp);
  // Create an auth token
  var auth = await newAuth(userid, sessionId);
  // Return auth token
  return (auth);
};

authRouter.post('/', async (req, res) => {
  // Validate the request body
  if (!(req.body.ids instanceof Array)) {
    return (
      res.status(400).json({
        message: 'Bad request'
      }).end()
    );
  }

  try {
    var clientIp = req.connection.remoteAddress;
    var auth = [];
    for (let i in req.body.ids) {
      // Log a new login and create auth token
      auth[i] = await login(req.body.ids[i], clientIp);
    }
    // Respond with auth tokens
    return (res.status(200).json(auth));
  } catch (err) {
    console.error(err);
    return (res.status(500).send({
      message: 'Internal Server Error'
    }));
  };
});

module.exports = authRouter;
