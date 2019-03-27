import * as regex from './regex.js';
import { majority } from './date-of-birth';

const validators = {
  firstnameOk: function (firstname) {
    return (
      (typeof firstname) === 'string' && // should be a string
      firstname !== '' && // should not be an empty string
      firstname.match(regex.firstname) // is good as an firstname
    );
  },
  lastnameOk: function (lastname) {
    return (
      (typeof lastname) === 'string' && // should be a string
      lastname !== '' && // should not be an empty string
      lastname.match(regex.lastname) // is good as an lastname
    );
  },
  emailOk: function (email) {
    return (
      (typeof email) === 'string' && // should be a string
      email !== '' && // should not be an empty string
      email.match(regex.email) // is good as an email
    );
  },
  loginOk: function (login) {
    const loginRgx = regex.login;
    const loginProhibRgx = regex.loginProhib;
    return (
      (typeof login) === 'string' && // should be a string
      login !== '' && // should not be en empty string
      login.match(loginRgx) && // Is good as a login
      !login.match(loginProhibRgx) // does not contain prohibited values (such as "admin")
    );
  },
  dobOk: function (dob) {
    var dob = new Date(dob);
    return (
      dob instanceof Date && // should be a date
      majority(dob) // majority test should return true
    );
  },
  genderOk: function (gender) {
    return (
      gender === 'other' ||
      gender === 'female' ||
      gender === 'male'
    );
  },
  passwOk: function (password) {
    const passwordRgx = regex.password;
    return (
      (typeof password) === 'string' && // should be a string
      password !== '' && // should not be an empty string
      password.match(passwordRgx) &&
      !!password.match(passwordRgx)[0] // is good as a password
    );
  },
  passwRepeatOk: function (passwRepeat, password) {
    return (
      (typeof passwRepeat) === 'string' && // should be a string
      passwRepeat !== '' && // should not be an empty string
      passwRepeat === password && // should be the same as the password
      validators.passwOk(password) // the password itself should be good
    );
  },
  bioOk: function (bio) {
    return (bio.length <= 600);
  },
};

export default validators;