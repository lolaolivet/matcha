/* eslint-disable */

'use strict';
var mocha = require('mocha');
var chakram = require('chakram');
var request = chakram.request;
var expect = chakram.expect;

// Admin
const devAdmin = require('../.test-utils/dev-admin');
const deleteUsers = devAdmin.deleteUsers;
const userPwdCode = devAdmin.userPwdCode;

// Random user creator
const randomUser = require('../.test-utils/random-user');
const registerUser = randomUser.registerUser;
const createRandomUser = randomUser.createRandomUser;

// Variables
const url = 'http://localhost:9000/api/forgot-password';

describe('tests for /forgot-password', function () {
  describe('tests for post', function () {

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

    // Get user's confirmation token id
    it('(admin) should get user\'s confirmation token id', () => {
      var response = userPwdCode(user.userid);
      response.then(res => {
        user.token = res.body;
        return (Promise.resolve(res));
      })
      expect(response).to.have.status(200);
      return chakram.wait();
    });

    it('should respond 204 for "Success"', function () {
      var response = request('post', url, {
        'body': {
          "email": user.email
        },
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        'time': true
      });

      expect(response).to.have.status(204);
      return chakram.wait();
    });

    it('should respond 400 for "Bad Request"', function () {
      var response = request('post', url, {
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        'time': true
      });

      expect(response).to.have.status(400);
      expect(response).to.have.schema({
        'type': 'object',
        'properties': {
          'message': {
            'type': 'string'
          }
        },
        'required': ['message']
      });
      return chakram.wait();
    });

    it('should respond 404 for "Email Not Found"', function () {
      var response = request('post', url, {
        'body': {
          'email': 'John@doh.com'
        },
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        'time': true
      });

      expect(response).to.have.status(404);
      expect(response).to.have.schema({
        'type': 'object',
        'properties': {
          'message': {
            'type': 'string'
          }
        },
        'required': ['message']
      });
      return chakram.wait();
    });

    // Delete users
    it('(admin) should delete user', () => {
      var response = deleteUsers(user.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });
});
