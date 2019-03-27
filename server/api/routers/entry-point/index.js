const passport = require('passport');
const proxy = require('express-http-proxy');
const router = require('express').Router();

const { jwtHeaderStrategy, newJWT } = require('../_utils/jwt');
passport.use('jwt-header', jwtHeaderStrategy);

router.use('/register', require('./register'));
router.use('/confirm', require('./confirm'));
router.use('/login', require('./login'));

/**
 *
 * Entry point for routes that are behind
 * the authentication wall should go below:
 *
 */

router.use('/location',
  // Auth
  passport.authenticate('jwt-header', { session: false }),
  // Router
  require('./location')
);

// Create logout log
router.use('/logout',
  // Auth
  passport.authenticate('jwt-header', { session: false }),
  // Router
  require('./logout')
);

// Refresh token
router.get('/refresh-token', passport.authenticate('jwt-header', {
  session: false
}), async (req, res) => {
  let userid = req.user.id;
  let sessionId = req.user.jti;
  var jwt = newJWT(userid, sessionId);
  res.status(200).send({
    jwt
  });
});

// Delete user
router.use('/delete-user',
  // Auth
  passport.authenticate('jwt-header', { session: false }),
  // Router
  require('./delete-user')
);

// Entry point for /users/...
router.use('/users',
  // Auth
  passport.authenticate('jwt-header', { session: false }),
  // Router
  require('../users')
);

// Entry point for /matcher/...
router.use('/matcher',
  // Auth
  passport.authenticate('jwt-header', { session: false }),
  // Proxy to the matcher
  proxy('http://matcher:9004/', {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // Pass the decoded user id
      proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
      return proxyReqOpts;
    }
  })
);

// Entry point for /messenger/...
router.use('/messenger',
  // Auth
  passport.authenticate('jwt-header', { session: false }),
  // Router
  require('../messenger')
);

// Entry point for /notif/...
router.use('/notif',
  // Auth
  passport.authenticate('jwt-header', { session: false }),
  // Router
  require('../notif')
);

router.use('/', require('./forgot-password'));

router.use('/', require('./new-pwd'));

// Check if the jwt is valid
router.use('/check-token',
  // Auth
  passport.authenticate('jwt-header', { session: false }),
  // Router
  require('./check-token')
);

module.exports = router;
