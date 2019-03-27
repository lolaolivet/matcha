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

// Random user creator
const randomUser = require("../.test-utils/random-user");
const registerUser = randomUser.registerUser;
const createRandomUser = randomUser.createRandomUser;

// Auth header creator
const authHeader = require("../../../_common/auth-header");

describe("tests for /matcher/display", function () {
  // Create users
  var user = createRandomUser();

  describe("(set up)", function() {
    it("should register user", () => {
      var response = registerUser(user).then(res => {
        user.userid = res.body.userid;
        return res;
      });

      expect(response).to.have.status(200);
      return chakram.wait();
    });

    // Confirm user
    it("(admin) should confirm user", () => {
      var response = confirmUser(user.userid);
      expect(response).to.have.status(202);
      return chakram.wait();
    });

    // Login and save JWT
    it("(/api/login) should successfully get connection token (user)", function() {
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
  });

  describe("tests", function() {
    describe("tests for get", function() {
      it('should respond 200 for "Ok"', function() {
        var response = request(
          "get",
          "http://localhost:9000/api/refresh-token",
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: authHeader(user.jwt)
            },
            time: true
          }
        );

        // Save JWT
        response.then(res => {
          user.jwt = res.body.jwt;
          // console.log(res.body);
          return Promise.resolve(res);
        });

        expect(response).to.have.status(200);
        expect(response).to.have.schema({
          type: "object",
          properties: {
            jwt: { type: "string" }
          },
          required: ["jwt"]
        });
        return chakram.wait();
      });

      it('should respond 200 for "Ok" (with updated token)', function() {
        var response = request(
          "get",
          "http://localhost:9000/api/refresh-token",
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: authHeader(user.jwt)
            },
            time: true
          }
        );

        // Save JWT
        response.then(res => {
          user.jwt = res.body.jwt;
          // console.log(res.body);
          return Promise.resolve(res);
        });

        expect(response).to.have.status(200);
        expect(response).to.have.schema({
          type: "object",
          properties: {
            jwt: { type: "string" }
          },
          required: ["jwt"]
        });
        return chakram.wait();
      });

      it('should respond 401 for "Forbidden (Invalid JWT)"', function() {
        var response = request(
          "get",
          "http://localhost:9000/api/refresh-token",
          {
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
  });

  describe("(clean up)", function () {
    // Delete users
    it('(admin) should delete user', () => {
      var response = deleteUsers(user.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });
});
