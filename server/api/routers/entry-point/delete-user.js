const router = require('express').Router();
const userExists = require('../../common/user-exists');
const deleteUser = require('../../common/delete-user');
const validators = require('../../common/profile-validators');
const bcrypt = require('bcryptjs');
const authDb = require('../_utils/auth-db');
const mailer = require('../_utils/mailer');

router.post('/', async (req, res) => {
  try {
    // Query ok
    if (!req.query.uid || !req.body.password) {
      return (res.status(400).send({
        code: 400,
        message: 'Bad Request'
      }));
    }
    // User mind his own business
    if (parseInt(req.query.uid) !== parseInt(req.user.id)) {
      return (res.status(403).end());
    }
    // User exists
    if (!(await userExists.id(req.query.uid))) {
      return (res.status(404).send({
        code: 404,
        message: 'User Not Found'
      }));
    }
    // check password
    if (!validators.passwOk(req.body.password)) {
      // Password incorrect
      return (
        res.status(400).send({
          code: 4002,
          message: 'Password is not valid'
        })
      );
    }
    // test password authenticity
    const userPwd = await authDb.verifyPassword(req.query.uid);
    if (!(bcrypt.compareSync(req.body.password, userPwd))) {
      return (
        res.status(400).send({
          code: 4001,
          message: 'Wrong password'
        })
      );
    }
    // Delete user
    const adress = await authDb.getEmailAdress(req.query.uid);
    await deleteUser(req.query.uid);
    // send notification goodbye love email
    const subject = 'A last goodbye message 🐬';
    const msg = 'Your account and datas have been successfuly deleted, We hope that you have found what you were looking for. With love 🌹, Matcha team';
    await mailer.sendMailNotification(adress.user_email, subject, msg);
    // Respond
    return (res.status(204).send());
  } catch (err) {
    return (res.status(500).send('Server Error'));
  }
});

module.exports = router;
