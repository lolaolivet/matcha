const router = require('express').Router();
const authDb = require('../_utils/auth-db');
const bcrypt = require('bcryptjs');
const userExists = require('../../common/user-exists');
const mailer = require('../_utils/mailer');
const validators = require('../../common/profile-validators');

// Update password
router.post('/new-pwd', async (req, res) => {
  try {
    if (
      req.body.password === undefined ||
      req.body.passwRepeat === undefined ||
      req.body.uid === undefined ||
      req.body.tid === undefined
    ) {
      // Incomplete request body
      return (
        res.status(400).send({
          code: 4001,
          message: 'Missing Parameters'
        })
      );
    }
    if (!(await userExists.id(req.body.uid))) {
      // Check that the user exists
      return (res.status(404).json({
        code: 404,
        message: 'user not found'
      }));
    }
    if (!validators.passwOk(req.body.password)) {
      // Password incorrect
      return (
        res.status(400).send({
          code: 4002,
          message: 'Password is not valid'
        })
      );
    }
    if (!validators.passwRepeatOk(req.body.passwRepeat, req.body.password)) {
      // Passwords don't match
      return (
        res.status(400).send({
          code: 4003,
          message: 'Passwords don\'t match'
        })
      );
    }
    // Check that token uuid is correct
    var tk = await authDb.getPwdToken(req.body.uid);
    if (tk && tk.uuid !== req.body.tid) {
      // token uuid not correct
      res.status(403).json({
        code: 403,
        message: 'Forbidden'
      });
      res.end();
      return;
    }

    // If the request come from ProfileEdit
    // Verify the old password to update it
    if (req.body.old && req.body.old !== undefined) {
      var pwd = await authDb.verifyPassword(req.body.uid);
      if (!(bcrypt.compareSync(req.body.old, pwd))) {
        return (
          res.status(400).send({
            code: 4001,
            message: 'Wrong password'
          })
        );
      }
    }
    // Hash the password
    var hashPwd = await bcrypt.hash(req.body.password, 8);
    // Update the password
    await authDb.updatePassword(req.body.uid, hashPwd);
    // send a notification email
    const adress = await authDb.getEmailAdress(req.body.uid);
    const subject = 'Your password has been changed';
    const msg = 'Your password has been changed, ignore this message if you did it, otherwise, you\'re fucked 🤷';
    await mailer.sendMailNotification(adress.user_email, subject, msg);

    return (
      res.status(204).end()
    );
  } catch (e) {
    return (
      res.status(500).send({
        code: 500,
        message: 'Internal Server Error'
      })
    );
  }
});

module.exports = router;
