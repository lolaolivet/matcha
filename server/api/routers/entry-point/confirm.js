const router = require('express').Router();
const authDb = require('../_utils/auth-db');
const userExists = require('../../common/user-exists');
const mailer = require('../_utils/mailer');

router.get('/', async (req, res) => {
  if (
    req.query.uid === undefined ||
    req.query.tid === undefined
  ) {
    return (
      res.status(400).send({
        message: 'Missing arguments',
        code: 400
      })
    );
  }
  try {
    let uid = req.query.uid;
    let uuid = req.query.tid;

    // Check that the user exists
    if (!(await userExists.id(uid))) {
      return (
        res.status(404).send({
          code: 404,
          message: 'user not found'
        })
      );
    }

    const token = await authDb.getMailToken(uid);
    if (token.exp < Date.now()) {
      return (
        res.status(401).send({
          code: 401,
          message: 'Confirmation link expired'
        })
      );
    }

    if (token.uuid !== uuid) {
      return (
        res.status(401).send({
          code: 401,
          message: 'Incorrect uuid'
        })
      );
    }

    const newEmailSet = await authDb.isNewEmailSet(uid);
    // If no "new_email" in db
    if (!newEmailSet) {
      // Check if already confirmed
      const confirmed = await authDb.checkConfirm(uid);
      if (confirmed) {
        res.status(401).send({
          code: 401,
          message: 'Already confirmed'
        });
      }
    } else {
      // set user_email with the confirmed email
      await authDb.confirmEmail(uid);
      // send a notification email
      const adress = await authDb.getEmailAdress(req.query.uid);
      const subject = 'Your email address has been changed';
      const msg = 'Your email address has been changed, ignore this message if you did it 🤷';
      await mailer.sendMailNotification(adress.user_email, subject, msg);
    }

    await authDb.confirm(uid);
    return res.status(204).end();
  } catch (error) {
    return (
      res.status(500).send({
        code: 500,
        message: 'Internal Server Error'
      })
    );
  }
});

router.post('/reset', async (req, res) => {
  if (req.body.email === undefined) {
    return (
      res.status(400).send({
        message: 'Missing argument',
        code: 400
      })
    );
  }
  try {
    var email = req.body.email;
    var tokenMail = authDb.createMailToken(24); // Create mail token with exp set 24 hours from now

    // Check that the user exists and get the user's id
    var userid = userExists.email(email);
    if (!userid) {
      return (
        res.status(404).send({
          code: 404,
          message: 'User Not Found'
        })
      );
    }
    // Save the new token
    await authDb.updateMailToken(userid, tokenMail);

    mailer.sendMailConfirm(email, userid, tokenMail.uuid);

    return res.status(204).end();
  } catch (error) {
    return (
      res.status(500).send({
        code: 500,
        message: 'Internal Server Error'
      })
    );
  }
});

module.exports = router;
