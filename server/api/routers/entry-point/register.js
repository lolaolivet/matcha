const router = require('express').Router();
const authDb = require('../_utils/auth-db');
const bcrypt = require('bcryptjs');
const sendMailConfirm = require('../_utils/mailer').sendMailConfirm;
const validators = require('../../common/profile-validators');

router.post('/', async (req, res) => {
  if (
    req.body &&
    req.body.firstname &&
    req.body.lastname &&
    req.body.login &&
    req.body.email &&
    req.body.dob &&
    req.body.gender &&
    req.body.password &&
    req.body.passwRepeat
  ) {
    let user = Object.assign({}, req.body);
    // Validate user
    try {
      const checks = await Promise.all([
        authDb.isEmailTaken(user.email),
        authDb.isLoginTaken(user.login)
      ]);
      if (checks[0] && checks[1]) {
        return (
          res.status(409).send({
            code: 4093,
            message: 'Both email and login are taken'
          })
        );
      } else if (checks[0]) {
        return (
          res.status(409).send({
            code: 4091,
            message: 'Email already registered'
          })
        );
      } else if (checks[1]) {
        return (
          res.status(409).send({
            code: 4092,
            message: 'This login is taken'
          })
        );
      } else if (!validators.emailOk(user.email)) {
        // email incorrect
        return (
          res.status(400).send({
            code: 4001,
            message: 'Email is not valid'
          })
        );
      } else if (!validators.loginOk(user.login)) {
        // login incorrect
        return (
          res.status(400).send({
            code: 4002,
            message: 'Login is not valid'
          })
        );
      } else if (!validators.passwOk(user.password)) {
        // password incorrect
        return (
          res.status(400).send({
            code: 4003,
            message: 'Password is not valid'
          })
        );
      } else if (!validators.passwRepeatOk(user.passwRepeat, user.password)) {
        // passwords don't match
        return (
          res.status(400).send({
            code: 4004,
            message: 'Passwords don\'t match'
          })
        );
      } else if (!validators.dobOk(user.dob)) {
        // dob incorrect
        return (
          res.status(400).send({
            code: 4005,
            message: 'Date of birth not valid'
          })
        );
      } else if (!validators.firstnameOk(user.firstname)) {
        // firstname incorrect
        return (
          res.status(400).send({
            code: 4006,
            message: 'Firstname not valid'
          })
        );
      } else if (!validators.lastnameOk(user.lastname)) {
        // lastname incorrect
        return (
          res.status(400).send({
            code: 4006,
            message: 'Firstname not valid'
          })
        );
      }
    } catch (error) {
      return (
        res.status(500).send({
          code: 500,
          message: 'Something went wrong with email and login verification'
        })
      );
    }

    try {
      var tokenMail = authDb.createMailToken(24); // Create mail token with exp set 24 hours from now
      var hashPwd = await bcrypt.hash(user.password, 8);
      user.userid =
        await authDb.register(
          user.email,
          user.login,
          hashPwd,
          tokenMail
        );
      sendMailConfirm(user.email, user.userid, tokenMail.uuid);
      await authDb.createProfile(user);

      const defaultPref = {
        ageMin: 18,
        ageMax: 80,
        scoreMin: 0,
        scoreMax: 100,
        distance: 5
      };
      user = {
        ...user,
        ...defaultPref,
      };
      await authDb.createPreference(user);
      await authDb.logDefaultPosition(user.userid);

      return (
        res.status(200).send({
          code: 200,
          userid: user.userid
        })
      );
    } catch (error) {
      return (
        res.status(500).send({
          code: 500,
          message: 'Error during user creation'
        })
      );
    }
  }

  // Default response
  return (
    res.status(400).send({
      message: 'missing parameters'
    }).end()
  );
});

module.exports = router;
