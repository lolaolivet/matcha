const router = require('express').Router();
const authDb = require('../_utils/auth-db');
const mailer = require('../_utils/mailer');

const userExists = require('../../common/user-exists');

// Create token mail to reinitialize password
router.post('/forgot-password', async (req, res) => {
  if (!(req.body.email)) {
    res.status(400).json({
      message: 'Missing Parameters'
    });
    res.end();
    return;
  }
  // Check that the email exists
  var userid = await userExists.email(req.body.email);
  if (userid === false) {
    return (res.status(404).json({
      code: 404,
      message: 'Email Not Found'
    }));
  }
  // Send email
  try {
    // Create a token
    var token = await authDb.createMailToken(24);
    // Update the token
    await authDb.updatePwdToken(userid, token);
    // Send mail
    mailer.sendMailPassword(req.body.email, userid, token.uuid);
    // Respond
    return (res.status(204).end());
  } catch (error) {
    console.error(error);
    return (
      res.status(500).send({
        code: 500,
        message: 'Internal Server Error'
      })
    );
  }
});

module.exports = router;
