const router = require('express').Router();
const authDb = require('../_utils/auth-db');
const bcrypt = require('bcryptjs');
const userExists = require('../../common/user-exists');
const useridToPrivateProfile = require('../../common/userid-to').privateProfile;
const { newJWT } = require('../_utils/jwt');

router.post('/', async (req, res) => {
  // Validate the request body
  if (!(req.body.login || req.body.email) || !(req.body.password)) {
    res.status(400).send({
      code: 400,
      message: 'Missing Parameters'
    });
    res.end();
    return;
  }

  try {
    let {
      login,
      email,
      password
    } = req.body;
    // Check that the user exists
    if (
      (login && !(await userExists.login(login))) ||
      (email && !(await userExists.email(email)))
    ) {
      return res.status(404).send({
        code: 404,
        message: 'user not found'
      });
    }
    // Get the user's infos
    let user =
      login
        ? await authDb.getUserBy.login(login)
        : await authDb.getUserBy.email(email);

    // Check that the user is confirmed
    if (!user['confirmed']) {
      return res.status(403).send({
        code: 403,
        message: 'Unconfirmed email address'
      });
    }

    // Check password
    const pwd = user['user_password'];
    if (!await bcrypt.compare(password, pwd)) {
      return res.status(401).send({
        code: 401,
        message: 'Wrong password'
      });
    }

    // Log a new login
    var userid = user['user_id'];
    var clientIp = req.connection.remoteAddress;
    var sessionId = await authDb.logSession(userid, clientIp);
    // Create jwt
    var jwt = newJWT(userid, sessionId);
    // Get the private profile
    var profile = await useridToPrivateProfile(userid);

    // Respond with jwt and private profile
    return (res.status(200).json({
      code: 200,
      jwt,
      profile
    }));
  } catch (err) {
    return (res.status(500).send({
      code: 500,
      message: 'Internal Server Error'
    }));
  };
});

module.exports = router;
