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
const userPwdCode = devAdmin.userPwdCode;

// Random user creator
const randomUser = require('../.test-utils/random-user');
const registerUser = randomUser.registerUser;
const createRandomUser = randomUser.createRandomUser;

// Variables
const url = 'http://localhost:9000/api/new-pwd';

describe('tests for /new-pwd', function () {
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

    it('(/forgot-password) should create token mail for the user', function () {
      var response = request('post', 'http://localhost:9000/api/forgot-password', {
        'body': {
          'email': user.email
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

    // Get user's confirmation token id
    it('(admin) should get user\'s pwd token id', () => {
      var response = userPwdCode(user.userid);
      response.then(res => {
        user.token = res.body;
        return (Promise.resolve(res));
      })
      expect(response).to.have.status(200);
      return chakram.wait();
    });

    const newPwd = 'Zxcvbnm123';

    it('should respond 400 for "Missing Parameters"', function () {
      var response = request('post', `${url}`, {
        'body': {
          'password': newPwd,
          'passwRepeat': newPwd,
          'uid': user.userid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        'time': true
      });

      expect(response).to.have.status(400);
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

    it('should respond 400 for "Password value not legal"', function () {
      var response = request('post', `${url}`, {
        'body': {
          'password': 'lwvjdlkev',
          'passwRepeat': 'lwvjdlkev',
          'uid': user.userid,
          'tid': user.token.uuid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        'time': true
      });

      expect(response).to.have.status(400);
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

    it('should respond 400 for "Password repeat incorrect"', function () {
      var response = request('post', `${url}`, {
        'body': {
          'password': newPwd,
          'passwRepeat': '123',
          'uid': user.userid,
          'tid': user.token.uuid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        'time': true
      });

      expect(response).to.have.status(400);
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

    it('should respond 400 for "Incorrect Password"', function () {
      var response = request('post', `${url}`, {
        'body': {
          'password': '',
          'passwRepeat': '',
          'uid': user.userid,
          'tid': user.token.uuid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        'time': true
      });

      expect(response).to.have.status(400);
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

    it('should respond 404 for "User Not Found"', function () {
      var response = request('post', `${url}`, {
        'body': {
          'password': newPwd,
          'passwRepeat': newPwd,
          'uid': 0,
          'tid': user.token.uuid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        'time': true
      });

      expect(response).to.have.status(404);
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

    it('should respond 403 for "Forbidden" (incorrect token id)', function () {
      var response = request('post', `${url}`, {
        'body': {
          'password': newPwd,
          'passwRepeat': newPwd,
          'uid': user.userid,
          'tid': 42
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        'time': true
      });

      expect(response).to.have.status(403);
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

    it('should respond 204 for "Success (Empty)"', function () {
      var response = request('post', `${url}`, {
        'body': {
          'password': newPwd,
          'passwRepeat': newPwd,
          'uid': user.userid,
          'tid': user.token.uuid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        'time': true
      });

      expect(response).to.have.status(204);
      return chakram.wait();
    });

    // Confirm user
    it('(admin) should confirm user', () => {
      var response = confirmUser(user.userid);
      expect(response).to.have.status(202);
      return chakram.wait();
    });

    it('(/api/login) Can\'t login with old pwd', function () {
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

      expect(response).to.have.status(401);
      return chakram.wait();

    });
    
    it('(/api/login) Can login with new pwd', function () {
      var response = request('post', 'http://localhost:9000/api/login', {
        'body': {
          "login": user.login,
          "password": newPwd
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

    // Delete user
    it('(admin) should delete user', () => {
      var response = deleteUsers(user.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });
});
