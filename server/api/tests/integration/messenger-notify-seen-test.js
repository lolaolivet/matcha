/* eslint-disable */
"use strict";
var mocha = require("mocha");
var chakram = require("chakram");
var request = chakram.request;
var expect = chakram.expect;

// Admin
const devAdmin = require("../.test-utils/dev-admin");
const confirmUser = devAdmin.confirmUser;
const deleteUsers = devAdmin.deleteUsers;
const userSpeaks = devAdmin.userSpeaks;

// Random user creator
const randomUser = require("../.test-utils/random-user");
const registerUser = randomUser.registerUser;
const createRandomUser = randomUser.createRandomUser;

// Auth header creator
const authHeader = require("../../../_common/auth-header");

// Create users
var user = createRandomUser();
var user2 = createRandomUser();
var lastMsgIds;

describe("tests for /messenger/message-seen", function() {
  describe("(set up)", function() {
    it("should register user", () => {
      var response = registerUser(user).then(res => {
        user.userid = res.body.userid;
        return res;
      });

      expect(response).to.have.status(200);
      return chakram.wait();
    });

    it("should register second user", () => {
      var response = registerUser(user2).then(res => {
        user2.userid = res.body.userid;
        return res;
      });

      expect(response).to.have.status(200);
      return chakram.wait();
    });

    // Confirm user
    it("(admin) should confirm first user", () => {
      var response = confirmUser(user.userid);
      expect(response).to.have.status(202);
      return chakram.wait();
    });

    // Confirm user
    it("(admin) should confirm second user", () => {
      var response = confirmUser(user2.userid);
      expect(response).to.have.status(202);
      return chakram.wait();
    });

    // Login and save JWT
    it("(/api/login) should successfully get connection token (first user)", function() {
      var response = request("post", "http://localhost:9000/api/login", {
        body: {
          login: user.login,
          password: user.password
        },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        time: true
      });

      // Save JWT
      response.then(res => {
        user.jwt = res.body.jwt;
        return Promise.resolve(res);
      });

      expect(response).to.have.status(200);
      expect(response).to.have.schema({
        type: "object",
        properties: {
          jwt: {
            type: "string"
            // "pattern": "^[A-Za-z0-9-_=]{10,30}\\.[A-Za-z0-9-_=]{10,30}\\.?[A-Za-z0-9-_.+/=]{10,30}$"
          }
        },
        required: ["jwt"]
      });
      return chakram.wait();
    });

    // Login and save JWT
    it("(/api/login) should successfully get connection token (second user)", function() {
      var response = request("post", "http://localhost:9000/api/login", {
        body: {
          login: user2.login,
          password: user2.password
        },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        time: true
      });

      // Save JWT
      response.then(res => {
        user2.jwt = res.body.jwt;
        return Promise.resolve(res);
      });

      expect(response).to.have.status(200);
      expect(response).to.have.schema({
        type: "object",
        properties: {
          jwt: {
            type: "string"
            // "pattern": "^[A-Za-z0-9-_=]{10,30}\\.[A-Za-z0-9-_=]{10,30}\\.?[A-Za-z0-9-_.+/=]{10,30}$"
          }
        },
        required: ["jwt"]
      });
      return chakram.wait();
    });

    it('(matcher/like) like', function () {
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

    it('(matcher/like) match', function () {
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

    // make them exchange a few words...
    it('(admin) make them exchange a few words...', async () => {
        var bla = await userSpeaks([
          {
            from: user.userid,
            to: user2.userid,
            txt: "HELLO"
          },
          {
            from: user2.userid,
            to: user.userid,
            txt: "HELLOHELLO"
          },
          {
            from: user.userid,
            to: user2.userid,
            txt: "HELLOHELLOHELLO"
          },
          {
            from: user.userid,
            to: user2.userid,
            txt: "HELLOHELLOHELLOHELLO"
          },
          {
            from: user2.userid,
            to: user.userid,
            txt: "HELLOHELLOHELLOHELLOHELLO"
          }
        ])

        lastMsgIds = bla.body;
        // console.log(lastMsgIds);
        expect(bla).to.have.status(202);
        return chakram.wait();
    });
  });

  describe("tests", function () {
    it('should respond 204 for "Ok"', function() {
      var response = request(
        "put",
        "http://localhost:9000/api/messenger/message-seen",
        {
          body: {
            msgId: lastMsgIds[0].msg_id, //recuperer les id des messages
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

    it('should respond 403 for "Forbidden"', function() {
      var response = request(
        "put",
        "http://localhost:9000/api/messenger/message-seen",
        {
          body: {
            msgId: lastMsgIds[0].msg_id, //recuperer les id des messages
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authHeader(user.jwt)
          },
          time: true
        }
      );
      expect(response).to.have.status(403);
      return chakram.wait();
    });

    it('should respond 400 for "Bad Request: missing parameter"', function() {
      var response = request(
        "put",
        "http://localhost:9000/api/messenger/message-seen",
        {
          body: {
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authHeader(user.jwt)
          },
          time: true
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

    it('should respond 401 for "Forbidden (Invalid JWT)"', function() {
      var response = request(
        "put",
        "http://localhost:9000/api/messenger/message-seen",
        {
          body: {
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: ""
          },
          time: true
        }
      );
      expect(response).to.have.status(401);
      return chakram.wait();
    });
  });

  describe("(clean up)", function () {
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

