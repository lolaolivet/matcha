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
const baseurl = 'http://localhost:9000/api/users';
const endpath = 'settings';

describe('tests for /users/{userid}/settings', function () {
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
      var response = request('get', `${baseurl}/${user.userid}/${endpath}`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        'time': true
      });

      expect(response).to.have.status(401);
      return chakram.wait();
    });

    it('should respond 200 for "Ok"', function () {
      var response = request('get', `${baseurl}/${user.userid}/${endpath}`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'time': true
      });

      expect(response).to.have.status(200)
      expect(response).to.have.schema({
        "type": "object",
        "properties": {
          "email": {
            "type": "string"
          },
          "login": {
            "type": "string"
          },
          "firstname": {
            "type": "string"
          },
          "lastname": {
            "type": "string"
          },
          "gender": {
            "type": "string"
          }
        }
      });
      return chakram.wait();
    });

    // it('should respond 403 for "Forbidden"', function() {
    //     var response = request('get', 'https://matcha.pamicel.com/api/users/90632033/info/settings', { 
    //         'headers': {"Content-Type":"application/json","Accept":"application/json","Authorization":""},
    //         'time': true
    //     });

    //     expect(response).to.have.status(403)
    //     expect(response).to.have.schema({"type":"object","properties":{"message":{"type":"string"}},"required":["message"]});
    //     return chakram.wait();
    // });

    it('should respond 404 for "user not found"', function () {
      var response = request('get', `${baseurl}/0/${endpath}`, {
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

    // Delete user
    it('(admin) should delete user', () => {
      var response = deleteUsers(user.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });



  describe('tests for put', function () {
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
      var response = request('put', `${baseurl}/${user.userid}/${endpath}`, {
        'body': {
          "gender": "female",
          "lastname": "       babibou         "
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

    it('should respond 201 for "Modified"', function () {
      var response = request('put', `${baseurl}/${user.userid}/${endpath}`, {
        'body': {
          "gender": "female",
          "lastname": "       babibou         "
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'time': true
      });

      expect(response).to.have.status(201)
      expect(response).to.have.schema({
        "type": "object",
        "properties": {
          "email": {
            "type": "object",
            "properties": {
              "newValue": {
                "type": "integer"
              },
              "modified": {
                "type": "boolean"
              },
              "error": {
                "type": "string"
              }
            }
          },
          "login": {
            "type": "object",
            "properties": {
              "newValue": {
                "type": "integer"
              },
              "modified": {
                "type": "boolean"
              },
              "error": {
                "type": "string"
              }
            }
          },
          "firstname": {
            "type": "object",
            "properties": {
              "newValue": {
                "type": "integer"
              },
              "modified": {
                "type": "boolean"
              },
              "error": {
                "type": "string"
              }
            }
          },
          "lastname": {
            "type": "object",
            "properties": {
              "newValue": {
                "type": "integer"
              },
              "modified": {
                "type": "boolean"
              },
              "error": {
                "type": "string"
              }
            }
          },
          "gender": {
            "type": "object",
            "properties": {
              "newValue": {
                "type": "integer"
              },
              "modified": {
                "type": "boolean"
              },
              "error": {
                "type": "string"
              }
            }
          }
        }
      });
      return chakram.wait();
    });

    it('should respond 201 for "Modified" (empty body)', function () {
      var response = request('put', `${baseurl}/${user.userid}/${endpath}`, {
        'body': {},
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'time': true
      });

      expect(response).to.have.status(201)
      expect(response).to.have.schema({
        "type": "object",
        "properties": {
          "email": {
            "type": "object",
            "properties": {
              "newValue": {
                "type": "integer"
              },
              "modified": {
                "type": "boolean"
              },
              "error": {
                "type": "string"
              }
            }
          },
          "login": {
            "type": "object",
            "properties": {
              "newValue": {
                "type": "integer"
              },
              "modified": {
                "type": "boolean"
              },
              "error": {
                "type": "string"
              }
            }
          },
          "firstname": {
            "type": "object",
            "properties": {
              "newValue": {
                "type": "integer"
              },
              "modified": {
                "type": "boolean"
              },
              "error": {
                "type": "string"
              }
            }
          },
          "lastname": {
            "type": "object",
            "properties": {
              "newValue": {
                "type": "integer"
              },
              "modified": {
                "type": "boolean"
              },
              "error": {
                "type": "string"
              }
            }
          },
          "gender": {
            "type": "object",
            "properties": {
              "newValue": {
                "type": "integer"
              },
              "modified": {
                "type": "boolean"
              },
              "error": {
                "type": "string"
              }
            }
          }
        }
      });
      return chakram.wait();
    });

    // it('should respond 400 for "Bad Request"', function() {
    //     var response = request('put', 'http://localhost:9000/api/users/0/info/settings', { 
    //         'body': {"email":"tempor@hotmtn.con","firstname":"adipisicing, si"},
    //         'headers': {"Content-Type":"application/json","Accept":"application/json","Authorization":"Excepteur consectetur"},
    //         'time': true
    //     });

    //     expect(response).to.have.status(400)
    //     expect(response).to.have.schema({"type":"object","properties":{"message":{"type":"string"}},"required":["message"]});
    //     return chakram.wait();
    // });

    it('should respond 404 for "user not found"', function () {
      var response = request('put', `${baseurl}/0/${endpath}`, {
        'body': {
          "firstname": "nulla consequat ex mollit",
          "email": "id"
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

    // Delete user
    it('(admin) should delete user', () => {
      var response = deleteUsers(user.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });
});