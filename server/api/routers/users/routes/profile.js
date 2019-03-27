const format = require('pg-format');

const db = require('../../../common/db');
const regex = require('./../../../common/regex');
const useridToProfileSummary = require('../../../common/userid-to').profileSummary;
const userExists = require('../../../common/user-exists');
const mailer = require('../../_utils/mailer');
const { majority } = require('../../../common/date-of-birth');
const selectProfile = require('../../../common/userid-to').selectProfile;

module.exports = {
  summary: async (req, res) => {
    if (req.params.userid) {
      if (!(await userExists.fn(req.params.userid))) {
        return (
          res.status(404).send({
            message: 'User Not Found',
            code: 404
          })
        );
      }
      var profileSummary = await useridToProfileSummary(req.params.userid);
      res.status(200).send(profileSummary);
    } else {
      res.status(400).send('Error 400');
    }
  },
  put: async (req, res) => {
    const update = async (table, dbKey, newVal, userid) => {
      let stmt = `UPDATE ${table} SET ${dbKey} = %L WHERE user_id = %L;`;
      let request = format(stmt, newVal, userid);
      let result = await db.query(request);
      let updated = !!result.rowCount;
      return (updated);
    };

    const updateTableValue = async (table, dbKey, newVal) => {
      // Shorthand for the userid
      let userid = req.params.userid;
      // Update the value (only if the value is legal)
      let updated = await update(table, dbKey, newVal, userid);
      // Log the change
      return ({
        done: updated,
        date: Date.now(),
        issue: updated ? undefined : 'Invalid value'
      });
    };

    try {
      let changes = {};
      let body = req.body;

      const match = (str, regex) => (typeof str === 'string' && str.trim().match(regex));

      const validators = {
        'firstname': (val) => (val.length <= 50 && match(val, regex['firstname'])),
        'lastname': (val) => (val.length <= 50 && match(val, regex['lastname'])),
        'login': (val) => (val.length <= 50 && match(val, regex['login']) && !match(val, regex['loginProhib'])),
        'email': (val) => (match(val, regex['email'])),
        'gender': (val) => (match(val, regex['gender'])),
        'bio': (val) => val.length <= 600,
        'birthDate': (val) => majority(new Date(val)),
      };

      if (
        !(
          Object.keys(body).length !== 0 &&
          (body.firstname === undefined || validators['firstname'](body.firstname)) &&
          (body.lastname === undefined || validators['lastname'](body.lastname)) &&
          (body.login === undefined || validators['login'](body.login)) &&
          (body.email === undefined || validators['email'](body.email)) &&
          (body.gender === undefined || validators['gender'](body.gender)) &&
          (body.bio === undefined || validators['bio'](body.bio)) &&
          (body.birthDate === undefined || validators['birthDate'](body.birthDate))
        )
      ) {
        return (
          res.status(400).send({
            message: 'Bad Request',
            code: 400,
          })
        );
      }

      if (body.firstname) changes.firstname = await updateTableValue('user_info', 'firstname', body.firstname);
      if (body.lastname) changes.lastname = await updateTableValue('user_info', 'lastname', body.lastname);
      if (body.login) changes.login = await updateTableValue('user_auth', 'user_login', body.login);
      if (body.email) {
        /*
          email modif :
        */
        const userEmail = (await db.query(
          'SELECT user_email FROM user_auth WHERE user_id = $1',
          [req.params.userid])).rows[0].user_email;
        if (userEmail !== body.email) {
          // put email in db as new_email
          if (body.email) changes.email = await updateTableValue('user_auth', 'new_email', body.email);
          // Create mail token with exp set 24 hours from now
          var tokenMail = mailer.createMailToken(24);
          //  put token in db as token_mail
          await updateTableValue('user_auth', 'token_mail', tokenMail);
          //  send mail
          mailer.sendMailEmail(body.email, req.user.id, tokenMail.uuid);
        } else {
          // else ignore email if current email
          // changes.email.done false if nothing happens true if email was sent
          changes.email = {
            done: false,
          };
        }
      }
      if (body.gender) changes.gender = await updateTableValue('user_info', 'gender', body.gender);
      if (body.bio) changes.bio = await updateTableValue('user_info', 'bio', body.bio);
      if (body.birthDate) changes.birthDate = await updateTableValue('user_info', 'dob', body.birthDate);

      let profile = await selectProfile(req.params.userid, null);
      // null --> undefined
      Object.keys(profile).map((key) => {
        if (profile[key] === null) {
          profile[key] = undefined;
        }
      });

      res.status(201).send({ profile, changes });
    } catch (err) {
      res.status(500).send({ message: 'Server Error' });
    }
  },

  get: async (req, res) => {
    try {
      let profile = await selectProfile(req.params.userid, req.user.id);
      let profileSummary = await useridToProfileSummary(req.params.userid);
      profile = {
        ...profile,
        ...profileSummary,
      };
      res.status(200).send(profile);
    } catch (err) {
      res.status(500).send({ message: 'Server Error', code: 500 });
    }
  },

  selectProfile
};
