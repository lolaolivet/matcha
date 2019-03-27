/* global describe, it */
'use strict';
var mocha = require('mocha'); // eslint-disable-line no-unused-vars
var chakram = require('chakram');
var request = chakram.request;
var expect = chakram.expect;

// Admin
const devAdmin = require('../.test-utils/dev-admin');
const deleteUsers = devAdmin.deleteUsers;
const userConfirmCode = devAdmin.userConfirmCode;

// Random user creator
const randomUser = require('../.test-utils/random-user');
const registerUser = randomUser.registerUser;
const createRandomUser = randomUser.createRandomUser;

// Variables
const url = 'http://localhost:9000/api/confirm';

describe('tests for /confirm', function () {
  describe('tests for get', function () {
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
      var response = userConfirmCode(user.userid);
      response.then(res => {
        user.token = res.body;
        return (Promise.resolve(res));
      });
      expect(response).to.have.status(200);
      return chakram.wait();
    });

    it('(/api/login) should fail to log in', function () {
      var response = request('post', 'http://localhost:9000/api/login', {
        'body': {
          'login': user.login,
          'password': user.password
        },
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        'time': true
      });

      expect(response).to.have.status(403);
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

    it('should respond 400 for Missing Token ID', function () {
      var response = request('get', `${url}?uid=0`, {
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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

    it('should respond 400 for "Missing User ID"', function () {
      var response = request('get', `${url}?tid=${user.token.uuid}`, {
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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

    it('should respond 404 for "User Not Found"', function () {
      var response = request('get', `${url}?uid=0&tid=${user.token.uuid}`, {
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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

    it('(/api/login) should fail to log in', function () {
      var response = request('post', 'http://localhost:9000/api/login', {
        'body': {
          'login': user.login,
          'password': user.password
        },
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        'time': true
      });

      expect(response).to.have.status(403);
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

    it('should respond 204 for "Success (Empty)"', function () {
      var response = request('get', `${url}?uid=${user.userid}&tid=${user.token.uuid}`, {
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        'time': true
      });

      expect(response).to.have.status(204);
      return chakram.wait();
    });

    // Login and save JWT
    it('(/api/login) should successfully get connection token', function () {
      var response = request('post', 'http://localhost:9000/api/login', {
        'body': {
          'login': user.login,
          'password': user.password
        },
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        'time': true
      });

      // Save JWT
      response.then((res) => {
        user.jwt = res.body.jwt;
        return (Promise.resolve(res));
      });

      expect(response).to.have.status(200);
      expect(response).to.have.schema({
        'type': 'object',
        'properties': {
          'jwt': {
            'type': 'string',
            // 'pattern': '^[A-Za-z0-9-_=]{10,30}\\.[A-Za-z0-9-_=]{10,30}\\.?[A-Za-z0-9-_.+/=]{10,30}$'
          }
        },
        'required': ['jwt']
      });
      return chakram.wait();
    });

    // Delete user
    it('(admin) should delete user', () => {
      var response = deleteUsers(user.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });
});
