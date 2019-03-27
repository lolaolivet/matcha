'use strict';
const chakram = require('chakram');
const request = chakram.request;

const registerUserPath = (rootURL) => (user) =>
  request('post', rootURL + '/api/register', {
    'body': user,
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    'time': true
  });

const registerUser = registerUserPath('http://localhost:9000');

const createRandomUser = () => {
  // Random name creator
  function createName(len) {
    var text = '';
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
    for (var i = 0; i < len; i++)
      text += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    return text;
  }
  const twenty = 6.307e+11;
  // Create a user
  var name = createName(10);
  return ({
    'firstname': 'Houzi',
    'lastname': 'Houza',
    'login': name,
    'email': name + '@john.do',
    'password': 'Qwerty123',
    'passwRepeat': 'Qwerty123',
    'dob': Date.now() - twenty,
    'gender': 'other'
  });
}

const registerRandomUser = () => {
  // Register the user
  return (registerUser(createRandomUser()));
};

module.exports = {
  registerRandomUser,
  registerUser,
  createRandomUser,
  registerUserPath,
};
