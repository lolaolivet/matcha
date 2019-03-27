/* eslint-disable */

'use strict';
var mocha = require('mocha');
var chakram = require('chakram');
var request = chakram.request;
var expect = chakram.expect;

// Auth header creator
const authHeader = require('../../../_common/auth-header');

// Admin
const devAdmin = require('../.test-utils/dev-admin');
const deleteUsers = devAdmin.deleteUsers;

// Variables
const baseurl = 'http://localhost:9000/api';

describe('tests for /matcher/matches', function () {
  describe('tests for get', function () {

    // Users array where the users will be stored
    var users = [];

    // Like test function
    // (depends on outside function users because of the way mocha works)
    const testLike = (status) => (senderIndex, receiverIndex) => function () {
      var response = request('post', 'http://localhost:9000/api/matcher/like', {
        'body': {
          "sender": users[senderIndex].userid,
          "receiver": users[receiverIndex].userid
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(users[senderIndex].jwt)
        },
        'time': true
      });

      expect(response).to.have.status(status)
      return chakram.wait();
    };

    const testBlock = (status) => (senderIndex, receiverIndex) => function () {
      // it('should respond 204 for "Ok"', function () {
        var response = request('post', 'http://localhost:9000/api/matcher/block', {
          'body': {
            // "uid": user.userid,
            // "blocked_uid": user2.userid
            "uid": users[senderIndex].userid,
            "blocked_uid": users[receiverIndex].userid
          },
          'headers': {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": authHeader(users[senderIndex].jwt)
          },
          'time': true
        });
        // response.then((res) => console.log("uid", users[senderIndex].userid, "blocked_uid", users[receiverIndex].userid));
        expect(response).to.have.status(status);
      return chakram.wait();
    };

    // it('BLOCKS - should respond 200 for "Ok"', function () {
    const testBlocks = (status) => (senderIndex, receiverIndex) => function () {
      var response = request(
        "get",
        `http://localhost:9000/api/matcher/blocks?uid=${users[senderIndex].userid}`,
        {
          'headers': {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": authHeader(users[senderIndex].jwt)
          },
          'time': true
        }
      );
      // response.then((res) => console.log(res.body));

      expect(response).to.have.status(status);
      expect(response).to.have.schema({
        type: "array",
        items: {
          type: "object",
          properties: {
            userid: { type: "integer", minimum: 1 },
            login: { type: "string", pattern: "(\\w){1,15}$" },
            "lastIn": {
              "description": "Epoch time in milliseconds",
              "type": "integer",
            },
            "lastOut": {
              "description": "Epoch time in milliseconds",
              "type": "integer",
            },
            birthDate: {
              description: "Epoch time in milliseconds",
              type: "integer"
            },
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
    };

    // Variations of the like test function
    const userLikeTest = testLike(204);
    const userMatchTest = testLike(200);
    const userBlockTest = testBlock(204);
    const userBlocksTest = testBlocks(200);

    // Create multiple users
    it('(admin) should create 5 confirmed users', async () => {
      var response = request('get', 'http://localhost:9002/user.create?n=5', {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        'time': true
      });

      users = (await response).body.userids;

      expect(response).to.have.status(200);
      return chakram.wait();
    });

    // Make fisrt user match with all other users
    it('(admin) should get these 5 users\'s connection tokens', async () => {
      var response = request('post', 'http://localhost:9002/user.login', {
        'body': {
          'ids': users
        },
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        'time': true
      });

      var jwts = ((await response).body).map(el => el.jwt);
      users = users.map((user, i) => ({userid: user, jwt: jwts[i]}));

      expect(response).to.have.status(200);
      return chakram.wait();
    });

    // 1 likes 0
    it('(/matcher/like) user 1 should like user 0', userLikeTest(1, 0));
    // 2 likes 0
    it('(/matcher/like) user 2 should like user 0', userLikeTest(2, 0));
    // 3 likes 0
    it('(/matcher/like) user 3 should like user 0', userLikeTest(3, 0));
    // 3 blocks 0
    it('(/matcher/block) user 3 should block user 0', userBlockTest(3, 0));
    // it('(/matcher/blocks) user 3 checked that he block user 0', userBlocksTest(3, 0));

    // 4 likes 0
    it('(/matcher/like) user 4 should like user 0', userLikeTest(4, 0));
    // 0 likes (and thus matches) with 1
    it('(/matcher/like) user 0 should match with user 1', userMatchTest(0, 1));
    // 0 likes (and thus matches) with 2
    it('(/matcher/like) user 0 should match with user 2', userMatchTest(0, 2));
    // 0 likes (and thus matches) with 3
    // it('(/matcher/like) user 0 should match with user 3', userMatchTest(0, 3));
    // 0 likes (and thus matches) with 4
    it('(/matcher/like) user 0 should match with user 4', userMatchTest(0, 4));
    it('(/matcher/block) user 0 should block user 4', userBlockTest(0, 4));



    // Test 401
    it('should respond 401 for "Unauthorized" (no auth header)', function () {
      var response = request('get', `${baseurl}/matcher/matches?uid=${users[0].userid}`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        'time': true
      });

      expect(response).to.have.status(401);
      return chakram.wait();
    });

    // Test 403
    it('should respond 403 for "You are not allowed to perform this action"', function () {
      var response = request('get', `${baseurl}/matcher/matches?uid=${users[1].userid}`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(users[0].jwt)
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

    // Test 400
    it('should respond 400 for "Missing query argument uid"', function () {
      var response = request('get', `${baseurl}/matcher/matches`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(users[0].jwt)
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

    // Test 404
    // (For when admin will have access to other users matches)
    // it('should respond 404 for "User Not Found"', function () {
    //   var response = request('get', `${baseurl}/matcher/matches?uid=0`, {
    //     'headers': {
    //       "Content-Type": "application/json",
    //       "Accept": "application/json",
    //       "Authorization": authHeader(users[0].jwt)
    //     },
    //     'time': true
    //   });

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

    it('should respond 200 for "Ok"', function () {
      var response = request('get', `${baseurl}/matcher/matches?uid=${users[0].userid}`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(users[0].jwt)
        },
        'time': true
      });
      // response.then((res) => console.log(res.body));
      expect(response).to.have.status(200);
      expect(response).to.have.schema({"type":"array","items":{"type":"object","properties":{"userid":{"type":"integer","minimum":1},"login":{"type":"string","pattern":"(\\w){1,15}$"},"birthDate":{"description":"Epoch time in milliseconds","type":"integer"},"gender":{"type":"string","enum":["male","female","other"]},"picture":{"title":"Picture","type":"object","properties":{"id":{"type":"integer","minimum":1},"url":{"type":"string"},"dateAdded":{"description":"Epoch time in milliseconds","type":"integer"},"ownerID":{"type":"integer","minimum":1}},"required":["id","url","dateAdded","ownerID"]}}}});
      return chakram.wait();
    });

    it('should have exactly two matches', async function () {
      var response = request('get', `${baseurl}/matcher/matches?uid=${users[0].userid}`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(users[0].jwt)
        },
        'time': true
      });
      const bodyLen = (await response).body.length;
      expect(bodyLen).to.equal(2);
      return chakram.wait();
    });

    // Delete users
    it('(admin) should delete all 5 users', () => {
      var response = deleteUsers(users.map(user => user.userid));
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });
});