'use strict';
const chakram = require('chakram');
const request = chakram.request;

const registerUser = (user) =>
  request('post', 'http://localhost:9000/api/register', {
    'body': user,
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    'time': true
  });



const createRandomUser = () => {
  // Random name creator
  function createName(len) {
    var text = '';
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < len; i++)
      text += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    return text;
  }
  // Create a user
  var name = createName(10);
  return ({
    'login': name,
    'email': name + '@john.do',
    'password': 'qwerty',
    'dob': Date.now() - 6.307e+11,
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
  createRandomUser
};