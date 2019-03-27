/* eslint-disable */
'use strict';

const userExists = require('../../../_common/user-exists');

var mocha = require('mocha'); // eslint-disable-line no-unused-vars
var chakram = require('chakram');
var request = chakram.request;
var expect = chakram.expect;

// Admin
const deleteUsers = (userids) => {
  if (!(userids instanceof Array)) {
    userids = [userids];
  }
  return request('delete', 'http://dev-admin:9002/user.delete', {
    'body': {
      ids: userids
    },
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    'time': true
  });
}

// Random user creator
const randomUser = require('../.test-utils/random-user');
const registerUser = randomUser.registerUserPath('http://api:9000');
const createRandomUser = randomUser.createRandomUser;

describe('tests for common/user-exists.js', function () {
  describe('tests for userExists.id', function () {
    // Create a user
    var user = createRandomUser();

    it('(prerequisite) should register user', () => {
      var response =
        registerUser(user)
        .then((res) => {
          user.userid = res.body.userid;
          return (res);
        });

      expect(response).to.have.status(200);
      return chakram.wait();
    });

    it('it should respond false for non existing user', async () => {
      const res = await userExists.id(user.userid + 10);
      return (res === false);
    });

    it('it should respond with user\'s userid for existing user', async () => {
      const res = await userExists.id(user.userid);
      return (res === user.userid);
    });

    // Delete user
    it('(admin) should delete user', () => {
      var response = deleteUsers(user.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });
});