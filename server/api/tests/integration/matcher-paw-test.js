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

// Useful
const randomIntegerInRange = (minimum, maximum) => (Math.floor(Math.random() * (maximum - minimum + 1)) + minimum);

// Variables
const baseurl = 'http://localhost:9000/api';
const pawIds = {
  place: randomIntegerInRange(1, 4),
  attitude: randomIntegerInRange(1, 4),
  weapon: randomIntegerInRange(1, 4)
}

describe('tests for /matcher/paw', function () {
  describe('tests for get', function () {

    // Create a user
    var user = createRandomUser();
    var paws;
    var pawResult;

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

    it('(prerequisite) should get all paws and create the expected response', async function () {
      var response = request('get', `${baseurl}/matcher/paw/available`, {
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          "Authorization": authHeader(user.jwt)
        },
        'time': true
      });

      paws = (await response).body;
      const place = paws.place.choices.filter((el) => el.id === pawIds.place)[0];
      const weapon = paws.weapon.choices.filter((el) => el.id === pawIds.weapon)[0];
      const attitude = paws.attitude.choices.filter((el) => el.id === pawIds.attitude)[0];
      pawResult = {
        place,
        weapon,
        attitude
      }

      expect(response).to.have.status(200);
      return chakram.wait();
    });

    it('(/paw/choose-p) should successfully choose a place', function () {
      var response = request('post', `${baseurl}/matcher/paw/choose-p`, {
        'body': {
          id: pawIds.place
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

    it('should respond 200 for "Ok"', async function () {
      var response = request('get', `${baseurl}/matcher/paw`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'time': true
      });

      expect(response).to.have.status(200);
      expect(response).to.have.schema({
        "title": "A user's current PAWs",
        "type": "object",
        "properties": {
          "place": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer"
              },
              "name": {
                "type": "string"
              },
              "darkName": {
                "type": "string"
              }
            }
          },
          "attitude": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer"
              },
              "name": {
                "type": "string"
              },
              "darkName": {
                "type": "string"
              }
            }
          },
          "weapon": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer"
              },
              "name": {
                "type": "string"
              },
              "darkName": {
                "type": "string"
              }
            }
          }
        }
      });

      var result = { ...pawResult };
      result.attitude = {};
      result.weapon = {};
      expect((await response).body).to.deep.equal(result);
      return chakram.wait();
    });

    it('(/paw/choose-a) should successfully choose an attitude', function () {
      var response = request('post', `${baseurl}/matcher/paw/choose-a`, {
        'body': {
          id: pawIds.attitude
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

    it('should respond 200 for "Ok"', async function () {
      var response = request('get', `${baseurl}/matcher/paw`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'time': true
      });

      expect(response).to.have.status(200);
      expect(response).to.have.schema({
        "title": "A user's current PAWs",
        "type": "object",
        "properties": {
          "place": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer"
              },
              "name": {
                "type": "string"
              },
              "darkName": {
                "type": "string"
              }
            }
          },
          "attitude": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer"
              },
              "name": {
                "type": "string"
              },
              "darkName": {
                "type": "string"
              }
            }
          },
          "weapon": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer"
              },
              "name": {
                "type": "string"
              },
              "darkName": {
                "type": "string"
              }
            }
          }
        }
      });

      var result = { ...pawResult };
      result.weapon = {};
      expect((await response).body).to.deep.equal(result);

      return chakram.wait();
    });

    it('(/paw/choose-w) should successfully choose a weapon', function () {
      var response = request('post', `${baseurl}/matcher/paw/choose-w`, {
        'body': {
          id: pawIds.weapon
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

    it('should respond 200 for "Ok"', async function () {
      var response = request('get', `${baseurl}/matcher/paw`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'time': true
      });

      expect(response).to.have.status(200);
      expect(response).to.have.schema({
        "title": "A user's current PAWs",
        "type": "object",
        "properties": {
          "place": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer"
              },
              "name": {
                "type": "string"
              },
              "darkName": {
                "type": "string"
              }
            }
          },
          "attitude": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer"
              },
              "name": {
                "type": "string"
              },
              "darkName": {
                "type": "string"
              }
            }
          },
          "weapon": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer"
              },
              "name": {
                "type": "string"
              },
              "darkName": {
                "type": "string"
              }
            }
          }
        }
      });

      expect((await response).body).to.deep.equal(pawResult);
      return chakram.wait();
    });

    it('should respond 401 for "Unauthorized" (no auth header)', function () {
      var response = request('get', `${baseurl}/matcher/paw`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        'time': true
      });

      expect(response).to.have.status(401);
      return chakram.wait();
    });


    // Create a user
    var user2 = createRandomUser();

    it('(admin) should register second user', () => {
      var response =
        registerUser(user2)
        .then((res) => {
          user2.userid = res.body.userid;
          return (res);
        });

      expect(response).to.have.status(200);
      return chakram.wait();
    });

    // Confirm user2
    it('(admin) should confirm user', () => {
      var response = confirmUser(user2.userid);
      expect(response).to.have.status(202);
      return chakram.wait();
    });

    // Login and save JWT
    it('(/api/login) should successfully get connection token', function () {
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


    it('should respond 200 for "Ok"', async function () {
      var response = request('get', `${baseurl}/matcher/paw?uid=${user.userid}`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user2.jwt)
        },
        'time': true
      });

      var body = (await response).body;

      expect(response).to.have.status(200);
      expect(response).to.have.schema({
        "title": "A user's current PAWs",
        "type": "object",
        "properties": {
          "place": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer"
              },
              "name": {
                "type": "string"
              },
              "darkName": {
                "type": "string"
              }
            }
          },
          "attitude": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer"
              },
              "name": {
                "type": "string"
              },
              "darkName": {
                "type": "string"
              }
            }
          },
          "weapon": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer"
              },
              "name": {
                "type": "string"
              },
              "darkName": {
                "type": "string"
              }
            }
          }
        }
      });

      expect((await response).body).to.deep.equal(pawResult);
      return chakram.wait();
    });

    // Delete user
    it('(admin) should delete user', () => {
      var response = deleteUsers(user.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });

    // Delete user
    it('(admin) should delete user', () => {
      var response = deleteUsers(user2.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });
});