/* eslint-disable */

'use strict';
// Test utilities
var mocha = require('mocha');
var chakram = require('chakram');
var request = chakram.request;
var expect = chakram.expect;

// Constant
const url = 'http://localhost:9002/user.confirm';
const loginUrl = 'http://localhost:9000/api/login';

// Random user creator
const randomUser = require('../.test-utils/random-user');
const registerUser = randomUser.registerUser;
const createRandomUser = randomUser.createRandomUser;

// Create a user
var user = createRandomUser();

// Tests
describe('tests for /user.confirm', function () {
  describe('tests for post', function () {
    it('(prerequisite) should create user', () => {
      var response =
        registerUser(user)
        .then((res) => {
          user.userid = res.body.userid;
          return (res);
        });
      expect(response).to.have.status(200);
      return chakram.wait();
    });

    it('(/api/login) should fail to log in', function () {
      var response = request('post', loginUrl, {
        'body': {
          "login": user.login,
          "password": user.password
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        'time': true
      });

      expect(response).to.have.status(403)
      expect(response).to.have.schema({
        "type": "object",
        "properties": {
          "message": {
            "type": "string"
          }
        },
        "required": ["message"]
      });
      return chakram.wait();
    });

    it('should respond 202 for "Ok"', function () {
      var response = request('post', url, {
        'body': {
          "id": user.userid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        'time': true
      });

      expect(response).to.have.status(202);
      return chakram.wait();
    });

    it('(/api/login) should successfully get connection token', function () {
      var response = request('post', loginUrl, {
        'body': {
          "login": user.login,
          "password": user.password
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        'time': true
      });

      expect(response).to.have.status(200);
      expect(response).to.have.schema({
        "type": "object",
        "properties": {
          "jwt": {
            "type": "string",
            // "pattern": "^[A-Za-z0-9-_=]{10,30}\\.[A-Za-z0-9-_=]{10,30}\\.?[A-Za-z0-9-_.+/=]{10,30}$"
          }
        },
        "required": ["jwt"]
      });
      return chakram.wait();
    });


    it('should respond 400 for "Bad Request"', function () {
      var response = request('post', url, {
        'body': {},
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        'time': true
      });

      expect(response).to.have.status(400)
      expect(response).to.have.schema({
        "type": "object",
        "properties": {
          "message": {
            "type": "string"
          }
        },
        "required": ["message"]
      });
      return chakram.wait();
    });

    it('should respond 404 for "Not Found"', function () {
      var response = request('post', url, {
        'body': {
          id: 0
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        'time': true
      });

      expect(response).to.have.status(404)
      expect(response).to.have.schema({
        "type": "object",
        "properties": {
          "message": {
            "type": "string"
          }
        },
        "required": ["message"]
      });
      return chakram.wait();
    });
  
    it('(cleanup) should delete user', function () {
      var response = request('delete', 'http://localhost:9002/user.delete', {
        'body': {
          'id': user.userid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        'time': true
      });

      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });
});