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
const baseurl = 'http://localhost:9000/api';

describe('tests for /matcher/unlike', function () {
  describe('tests for PUT', function () {
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
    it('(admin) should confirm user', () => {
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
    it('(/api/login) should log in as user2', function () {
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

    it('(/matcher/like) user2 should like user1', function () {
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

      expect(response).to.have.status(204)
      return chakram.wait();
    });

    it('(/matcher/like) user2 should like user1 again', function () {
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

      expect(response).to.have.status(204)
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

    // Test 401
    it('should respond 401 for "Unauthorized" (no auth header)', function () {
      var response = request('put', `${baseurl}/matcher/unlike`, {
        'body': {
          'sender': user.userid,
          'receiver': user2.userid
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

    it('should respond 400 for "Cannot unlike someone you never liked"', function () {
      var response = request('put', `${baseurl}/matcher/unlike`, {
        'body': {
          'sender': user.userid,
          'receiver': user2.userid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
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

    it('should respond 400 for "Bad Request" (empty body)', function () {
      var response = request('put', `${baseurl}/matcher/unlike`, {
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

    it('should respond 404 for "User Not Found"', function () {
      var response = request('put', `${baseurl}/matcher/unlike`, {
        'body': {
          "sender": user.userid,
          "receiver": 0
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

    it('should respond 403 for "You are not allowed to perform this action"', function () {
      var response = request('put', `${baseurl}/matcher/unlike`, {
        'body': {
          'sender': user2.userid,
          'receiver': user.userid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
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

    it('(/matcher/like) user1 should like user2', function () {
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

      expect(response).to.have.status(200);
      expect(response).to.have.schema({"type":"string"});
      return chakram.wait();
    });

    it('should respond 204 for "Ok"', function () {
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

    it('should respond 400 for "Cannot unlike someone you never liked or already unliked"', function () {
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


    it('(/matcher/like) user1 should like user2', function () {
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

      expect(response).to.have.status(200);
      expect(response).to.have.schema({"type":"string"});
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

    it('should respond 400 for "Cannot unlike somebody blocked from you"', function () {
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

    it('user2 unblock user / should respond 204 for "Ok"', function() {
      var response = request(
        "put",
        "http://localhost:9000/api/matcher/unblock",
        {
          body: {
            uid: user2.userid,
            unblock_uid: user.userid
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authHeader(user2.jwt)
          },
          time: true
        }
      );

      expect(response).to.have.status(204);
      return chakram.wait();
    });

    it('user can finaly unlike user2 / should respond 204 for "Ok"', function () {
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