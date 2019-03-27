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

// Variables
const baseurl = 'http://localhost:9000/api';

describe("tests for /logout", function() {
  describe("tests for post", function() {

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
    var response = request('post', `${baseurl}/login`, {
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

  // Create a second user
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
        var response = confirmUser(user2.userid);
        expect(response).to.have.status(202);
        return chakram.wait();
      });
  
     // Login and save JWT
     it('(/api/login) should successfully get connection token', function () {
      var response = request('post', `${baseurl}/login`, {
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

///////////////    

    it('LOGOUT - should respond 200 for "Ok"', async function() {
      var response = request("post", `${baseurl}/logout`, {
        'body' : {
          'userid': user.userid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'time': true
      });
      // response.then(res => console.log(res.body));
      expect(response).to.have.status(204);
      return chakram.wait();
    });

    it('should respond 400 for "Bad Request"', function() {
      var response = request("post", `${baseurl}/logout`, {
        'body' : {
          'userid': ''
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
        type: "object",
        properties: { message: { type: "string" } },
        required: ["message"]
      });
      return chakram.wait();
    });

    it('should respond 403 for "Unauthorized (Restricted Action)"', function() {
      var response = request('post', `${baseurl}/logout`, {
        'body' : {
          'userid': user.userid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user2.jwt)
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

    // it('should respond 404 for "Not Found"', function() {
    //   var response = request("post", `${baseurl}/logout`, {
    //     'body' : {
    //       'userid': 500
    //     },
    //     'headers': {
    //       "Content-Type": "application/json",
    //       "Accept": "application/json",
    //       "Authorization": authHeader(user.jwt)
    //     },
    //     'time': true
    //   });
    //   response.then(res => console.log(res.body));

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
    it('(admin) should delete user', () => {
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
