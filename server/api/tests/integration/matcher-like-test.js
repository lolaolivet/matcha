/* eslint-disable */
'use strict';
var mocha = require('mocha');
var chakram = require('chakram');
var request = chakram.request;
var expect = chakram.expect;

// Admin
const devAdmin = require('../.test-utils/dev-admin');
const confirmUser = devAdmin.confirmUser;
const deleteUsers = devAdmin.deleteUsers;

// Random user creator
const randomUser = require('../.test-utils/random-user');
const registerUser = randomUser.registerUser;
const createRandomUser = randomUser.createRandomUser;

// Auth header creator
const authHeader = require('../../../_common/auth-header');

describe('tests for /matcher/like', function () {
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

    // Create a user
    var user2 = createRandomUser();

    it('(prerequisite) should register second user', () => {
      var response =
        registerUser(user2)
        .then((res) => {
          user2.userid = res.body.userid;
          return (res);
        });

      expect(response).to.have.status(200);
      return chakram.wait();
    });

    // Confirm user
    it('(admin) should confirm first user', () => {
      var response = confirmUser(user.userid);
      expect(response).to.have.status(202);
      return chakram.wait();
    });

    // Confirm user
    it('(admin) should confirm second user', () => {
      var response = confirmUser(user2.userid);
      expect(response).to.have.status(202);
      return chakram.wait();
    });

    // Login and save JWT
    it('(/api/login) should successfully get connection token (first user)', function () {
      var response = request('post', 'http://localhost:9000/api/login', {
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

      // Save JWT
      response.then((res) => {
        user.jwt = res.body.jwt;
        return (Promise.resolve(res));
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

    // Login and save JWT
    it('(/api/login) should successfully get connection token (second user)', function () {
      var response = request('post', 'http://localhost:9000/api/login', {
        'body': {
          "login": user2.login,
          "password": user2.password
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        'time': true
      });

      // Save JWT
      response.then((res) => {
        user2.jwt = res.body.jwt;
        return (Promise.resolve(res));
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

    // Test 401
    it('should respond 401 for "Unauthorized" (no auth header)', function () {
      var response = request('post', 'http://localhost:9000/api/matcher/like', {
        'body': {
          "sender": user.userid,
          "receiver": user2.userid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        'time': true
      });

      expect(response).to.have.status(401);
      return chakram.wait();
    });

    // Test 403
    it('should respond 403 for "Forbidden"', function () {
      var response = request('post', 'http://localhost:9000/api/matcher/like', {
        'body': {
          "sender": user2.userid,
          "receiver": user.userid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'time': true
      });

      expect(response).to.have.status(403);
      return chakram.wait();
    });


    it('should respond 204 for "Ok"', function () {
      var response = request('post', 'http://localhost:9000/api/matcher/like', {
        'body': {
          "sender": user.userid,
          "receiver": user2.userid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'time': true
      });

      expect(response).to.have.status(204);
      return chakram.wait();
    });

    it('should respond 200 for "Matched"', function () {
      var response = request('post', 'http://localhost:9000/api/matcher/like', {
        'body': {
          "sender": user2.userid,
          "receiver": user.userid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user2.jwt)
        },
        'time': true
      });
      expect(response).to.have.status(200);
      expect(response).to.have.schema({"type": "string"});
      return chakram.wait();
    });

    it('should respond 400 for "Bad Request"', function () {
      var response = request('post', 'http://localhost:9000/api/matcher/like', {
        'body': {
          "sender": user.userid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
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

    it('should respond 400 for "Bad Request"', function () {
      var response = request('post', 'http://localhost:9000/api/matcher/like', {
        'body': {
          "sender": user.userid,
          "receiver": user.userid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
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

    it('should respond 400 for "Bad Request"', function () {
      var response = request('post', 'http://localhost:9000/api/matcher/like', {
        'body': {},
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
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
      var response = request('post', 'http://localhost:9000/api/matcher/like', {
        'body': {
          "receiver": 0,
          "sender": user.userid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
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
///////////////////////////////////////

it('user unlike user 2 / should respond 204 for "Ok"', function () {
  var response = request('put', 'http://localhost:9000/api/matcher/unlike', {
    'body': {
      "sender": user.userid,
      "receiver": user2.userid
    },
    'headers': {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": authHeader(user.jwt)
    },
    'time': true
  });

  expect(response).to.have.status(204);
  return chakram.wait();
});
        //post block
        it('user2 block user / should respond 204 for "Ok"', function () {
          var response = request('post', 'http://localhost:9000/api/matcher/block', {
            'body': {
              "uid": user2.userid,
              "blocked_uid": user.userid
            },
            'headers': {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": authHeader(user2.jwt)
            },
            'time': true
          });

          expect(response).to.have.status(204);
          return chakram.wait();
        });

        it('should respond 400 for "Cannot like or be liked by somebody blocked from you"', function () {
          var response = request('post', 'http://localhost:9000/api/matcher/like', {
            'body': {},
            'headers': {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": authHeader(user.jwt)
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

    // Delete users
    it('(admin) should delete first user', () => {
      var response = deleteUsers(user.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
    it('(admin) should delete second user', () => {
      var response = deleteUsers(user2.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });
});