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

describe("tests for /matcher/score", function() {
  describe("tests for get", function() {

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
    // Create a user
    var user3 = createRandomUser();
    it('(prerequisite) should register third user', () => {
      var response =
        registerUser(user3)
          .then((res) => {
            user3.userid = res.body.userid;
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
    // Confirm user
    it('(admin) should confirm second user', () => {
      var response = confirmUser(user3.userid);
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
    // Login and save JWT
    it('(/api/login) should successfully get connection token (second user)', function () {
      var response = request('post', 'http://localhost:9000/api/login', {
        'body': {
          "login": user3.login,
          "password": user3.password
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        'time': true
      });
      // Save JWT
      response.then((res) => {
        user3.jwt = res.body.jwt;
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

////////////////// scenar ////////////////////
// user display user2
it('should respond 204 for "Ok"', function () {
  var response = request(
    'post',
    'http://localhost:9000/api/matcher/display',
    {
      'body': {
        'uid': user.userid,
        'viewedUid': user2.userid
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader(user.jwt)
      },
      time: true
    }
  );
  expect(response).to.have.status(204);
  return chakram.wait();
});
// user likes user2
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
// user2 display user
it('should respond 204 for "Ok"', function () {
  var response = request(
    'post',
    'http://localhost:9000/api/matcher/display',
    {
      'body': {
        'uid': user2.userid,
        'viewedUid': user.userid
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader(user.jwt)
      },
      time: true
    }
  );
  // response.then(res => console.log(res.body));
  expect(response).to.have.status(204);
  return chakram.wait();
});
// user2 likes user
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
// user3 display user
it('should respond 204 for "Ok"', function () {
  var response = request(
    'post',
    'http://localhost:9000/api/matcher/display',
    {
      'body': {
        'uid': user3.userid,
        'viewedUid': user.userid
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader(user.jwt)
      },
      time: true
    }
  );
  // response.then(res => console.log(res.body));
  expect(response).to.have.status(204);
  return chakram.wait();
});
// user3 likes user
it('should respond 204 for "Ok"', function () {
  var response = request('post', 'http://localhost:9000/api/matcher/like', {
    'body': {
      "sender": user3.userid,
      "receiver": user.userid
    },
    'headers': {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": authHeader(user3.jwt)
    },
    'time': true
  });
  expect(response).to.have.status(204);
  return chakram.wait();
});
// user blocks user3
it('should respond 204 for "Ok"', function () {
  var response = request('post', 'http://localhost:9000/api/matcher/block', {
    'body': {
      "uid": user.userid,
      "blocked_uid": user3.userid
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
// user2 likes user3
it('should respond 204 for "Ok"', function () {
  var response = request('post', 'http://localhost:9000/api/matcher/like', {
    'body': {
      "sender": user2.userid,
      "receiver": user3.userid
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
// user3 ignore user2
// user2 unlikes user3
it('should respond 204 for "Ok"', function () {
  var response = request('put', 'http://localhost:9000/api/matcher/unlike', {
    'body': {
      "sender": user2.userid,
      "receiver": user3.userid
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
////////////////////////////////////////////////
    it('SCORE should respond 200 for "Ok"', function() {
      var response = request(
        "get",
        `http://localhost:9000/api/matcher/score?uid=${user.userid}`,
        {
          'headers': {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": authHeader(user.jwt)
          },
          'time': true
        }
      );
      // response.then(res => console.log('response user', res.body));
      expect(response).to.have.status(200);
      expect(response).to.have.schema({ type: "number" });
      return chakram.wait();
    });
    it('SCORE should respond 200 for "Ok"', function() {
      var response = request(
        "get",
        `http://localhost:9000/api/matcher/score?uid=${user2.userid}`,
        {
          'headers': {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": authHeader(user2.jwt)
          },
          'time': true
        }
      );
      // response.then(res => console.log('response user2', res.body));
      expect(response).to.have.status(200);
      expect(response).to.have.schema({ type: "number" });
      return chakram.wait();
    });
    it('SCORE should respond 200 for "Ok"', function() {
      var response = request(
        "get",
        `http://localhost:9000/api/matcher/score?uid=${user3.userid}`,
        {
          'headers': {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": authHeader(user3.jwt)
          },
          'time': true
        }
      );
      // response.then(res => console.log('response user3', res.body));
      expect(response).to.have.status(200);
      expect(response).to.have.schema({ type: "number" });
      return chakram.wait();
    });

    // ERRORS
    it('should respond 400 for "Bad Request: missing parameter"', function() {
      var response = request(
        "get",
        `http://localhost:9000/api/matcher/score`,
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

    it('should respond 401 for "Forbidden (Invalid JWT)"', function() {
      var response = request(
        "get",
        `http://localhost:9000/api/matcher/score?uid=${user.userid}`,
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


    // it('should respond 404 for "User Not Found"', function() {
    //   var response = request(
    //     "get",
    //     "http://matcha.pamicel.com/api/matcher/score",
    //     {
    //       qs: { uid: -29266544 },
    //       headers: {
    //         "Content-Type": "application/json",
    //         Accept: "application/json",
    //         Authorization: "quis nisi irur"
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
    it('(admin) should delete second user', () => {
      var response = deleteUsers(user3.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });
});
