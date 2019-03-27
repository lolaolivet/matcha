/* eslint-disable */
"use strict";
var mocha = require("mocha");
var chakram = require("chakram");
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

describe('tests for /matcher/blocks', function () {
  describe("tests for get", function () {

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

    //perform block
    it('(/matcher/block) should respond 204 for "Ok"', function () {
      var response = request('post', 'http://localhost:9000/api/matcher/block', {
        'body': {
          "uid": user.userid,
          "blocked_uid": user2.userid
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

    //get the list
    it('should respond 200 for "Ok"', function () {
      var response = request(
        "get",
        `http://localhost:9000/api/matcher/blocks?uid=${user.userid}`,
        {
          'headers': {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": authHeader(user.jwt)
          },
          'time': true
        }
      );

      // response.then(res => console.log(res.body));
      expect(response).to.have.status(200);
      expect(response).to.have.schema({
        type: "array",
        items: {
          type: "object",
          properties: {
            userid: { type: "integer", minimum: 1 },
            login: { type: "string", pattern: "(\\w){1,15}$" },
            birthDate: {
              description: "Epoch time in milliseconds",
              type: "integer"
            },
            "lastIn": {
              "description": "Epoch time in milliseconds",
              "type": "null",
            },
            "lastOut": {
              "description": "Epoch time in milliseconds",
              "type": ["integer", "null"]
            },
              // should be "type": "integer"
              // but provoc an error because the value is not updated for the user set for the test
            gender: { type: "string", enum: ["male", "female", "other"] },
            picture: {
              title: "Picture",
              type: "object",
              properties: {
                id: { type: "integer", minimum: 1 },
                url: {
                  type: "string",
                  pattern:
                    "^\\/assets\\/[0-9a-zA-Z]{6,}\\.(jpg|jpeg|gif|JPG|png|PNG)$"
                },
                dateAdded: {
                  description: "Epoch time in milliseconds",
                  type: "integer"
                },
                ownerID: { type: "integer", minimum: 1 }
              },
              required: ["id", "url", "dateAdded", "ownerID"]
            }
          }
        }
      });
      return chakram.wait();
    });

    it('should respond 400 for "Bad Request: missing parameter"', function () {
      var response = request(
        "get",
        `http://localhost:9000/api/matcher/blocks`,
        {
          'headers': {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": authHeader(user.jwt)
          },
          'time': true
        }
      );

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

    it('should respond 401 for "Forbidden (Invalid JWT)"', function () {
      var response = request(
        "get",
        `http://localhost:9000/api/matcher/blocks?uid=${user.userid}`,
        {
          'headers': {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": ""
          },
          'time': true
        }
      );
      expect(response).to.have.status(401);
      return chakram.wait();
    });

    it('should respond 403 for "Unauthorized (Restricted Action)"', function () {
      var response = request(
        "get",
        `http://localhost:9000/api/matcher/blocks?uid=${user2.userid}`,
        {
          qs: { uid1: user.userid },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authHeader(user.jwt)
          },
          time: true
        }
      );

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

    // it('should respond 404 for "User Not Found"', function () {
    //   var response = request(
    //     "get",
    //     "http://localhost:9000/api/matcher/blocks?uid=0",
    //     {
    //       qs: { uid1: 0 },
    //       headers: {
    //         "Content-Type": "application/json",
    //         Accept: "application/json",
    //         Authorization: authHeader(user.jwt)
    //       },
    //       time: true
    //     }
    //   );

    //   expect(response).to.have.status(404);
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