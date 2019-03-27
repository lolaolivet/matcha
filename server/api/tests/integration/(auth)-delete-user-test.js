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

// Variables
const baseurl = 'http://localhost:9000/api/delete-user';

describe('tests for /delete-user', function () {
  describe('tests for delete', function () {
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

    // Confirm user
    it('(admin) should confirm user', () => {
      var response = confirmUser(user.userid);
      expect(response).to.have.status(202);
      return chakram.wait();
    });

    // Login and save JWT
    it('(/api/login) should successfully get connection token', function () {
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

    it('should respond 401 for "Unauthorized" (no auth header)', function () {
      var response = request('post', `${baseurl}?uid=${user.userid}`, {
        'body': {
          "password": user.password
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

    it('should respond 403 for "Unauthorized" (other userid)', function () {
      var response = request('post', `${baseurl}?uid=0`, {
        'body': {
          "password": user.password
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'time': true
      });

      expect(response).to.have.status(403)
      return chakram.wait();
    });


    // it('should respond 404 for "Not Found" (other userid)', function () {
    //   var response = request('post', `${baseurl}?uid=0`, {
    //     'body': {
    //       "password": user.password
    //     },
    //     'headers': {
    //       "Content-Type": "application/json",
    //       "Accept": "application/json",
    //       "Authorization": authHeader(user.jwt)
    //     },
    //     'time': true
    //   });

    //   expect(response).to.have.status(404)
    //   expect(response).to.have.schema({
    //     "type": "object",
    //     "properties": {
    //       "message": {
    //         "type": "string"
    //       }
    //     },
    //     "required": ["message"]
    //   });
    //   return chakram.wait();
    // });


    it('should respond 204 for "Success (Empty)"', function () {
      var response = request('post', `${baseurl}?uid=${user.userid}`, {
        'body': {
          "password": user.password
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'time': true
      });

      expect(response).to.have.status(204)
      return chakram.wait();
    });

    it('should respond 401 for "Unauthorized" (same userid & jwt)', function () {
      var response = request('post', `${baseurl}?uid=${user.userid}`, {
        'body': {
          "password": user.password
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'time': true
      });

      expect(response).to.have.status(401);
      return chakram.wait();
    });
  });
});