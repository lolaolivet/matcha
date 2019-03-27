// /* eslint-disable */
// "use strict";
// var mocha = require("mocha");
// var chakram = require("chakram");
// var request = chakram.request;
// var expect = chakram.expect;

// // Admin
// const devAdmin = require("../.test-utils/dev-admin");
// const confirmUser = devAdmin.confirmUser;
// const deleteUsers = devAdmin.deleteUsers;

// // Random user creator
// const randomUser = require("../.test-utils/random-user");
// const registerUser = randomUser.registerUser;
// const createRandomUser = randomUser.createRandomUser;

// // Auth header creator
// const authHeader = require("../../../_common/auth-header");

// // Create users
// var user = createRandomUser();
// var user2 = createRandomUser();

// describe("tests for /matcher/displays", function () {
//   describe("(set up users)", function() {
//     it("should register user", () => {
//       var response = registerUser(user).then(res => {
//         user.userid = res.body.userid;
//         return res;
//       });

//       expect(response).to.have.status(200);
//       return chakram.wait();
//     });

//     it("should register second user", () => {
//       var response = registerUser(user2).then(res => {
//         user2.userid = res.body.userid;
//         return res;
//       });

//       expect(response).to.have.status(200);
//       return chakram.wait();
//     });

//     // Confirm user
//     it("(admin) should confirm first user", () => {
//       var response = confirmUser(user.userid);
//       expect(response).to.have.status(202);
//       return chakram.wait();
//     });

//     // Confirm user
//     it("(admin) should confirm second user", () => {
//       var response = confirmUser(user2.userid);
//       expect(response).to.have.status(202);
//       return chakram.wait();
//     });

//     // Login and save JWT
//     it("(/api/login) should successfully get connection token (first user)", function() {
//       var response = request("post", "http://localhost:9000/api/login", {
//         body: {
//           login: user.login,
//           password: user.password
//         },
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json"
//         },
//         time: true
//       });

//       // Save JWT
//       response.then(res => {
//         user.jwt = res.body.jwt;
//         return Promise.resolve(res);
//       });

//       expect(response).to.have.status(200);
//       expect(response).to.have.schema({
//         type: "object",
//         properties: {
//           jwt: {
//             type: "string"
//             // "pattern": "^[A-Za-z0-9-_=]{10,30}\\.[A-Za-z0-9-_=]{10,30}\\.?[A-Za-z0-9-_.+/=]{10,30}$"
//           }
//         },
//         required: ["jwt"]
//       });
//       return chakram.wait();
//     });

//     // Login and save JWT
//     it("(/api/login) should successfully get connection token (second user)", function() {
//       var response = request("post", "http://localhost:9000/api/login", {
//         body: {
//           login: user2.login,
//           password: user2.password
//         },
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json"
//         },
//         time: true
//       });

//       // Save JWT
//       response.then(res => {
//         user2.jwt = res.body.jwt;
//         return Promise.resolve(res);
//       });

//       expect(response).to.have.status(200);
//       expect(response).to.have.schema({
//         type: "object",
//         properties: {
//           jwt: {
//             type: "string"
//             // "pattern": "^[A-Za-z0-9-_=]{10,30}\\.[A-Za-z0-9-_=]{10,30}\\.?[A-Za-z0-9-_.+/=]{10,30}$"
//           }
//         },
//         required: ["jwt"]
//       });
//       return chakram.wait();
//     });
//   });

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

describe('tests for /matcher/displays', function () {
  describe('tests for get', function () {

    // Users array where the users will be stored
    var users = [];

    // // Like test function
    // // (depends on outside function users because of the way mocha works)
    // const testLike = (status) => (senderIndex, receiverIndex) => function () {
    //   var response = request('post', 'http://localhost:9000/api/matcher/like', {
    //     'body': {
    //       "sender": users[senderIndex].userid,
    //       "receiver": users[receiverIndex].userid
    //     },
    //     'headers': {
    //       "Content-Type": "application/json",
    //       "Accept": "application/json",
    //       "Authorization": authHeader(users[senderIndex].jwt)
    //     },
    //     'time': true
    //   });

    //   expect(response).to.have.status(status)
    //   return chakram.wait();
    // };

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

    // // it('BLOCKS - should respond 200 for "Ok"', function () {
    // const testBlocks = (status) => (senderIndex, receiverIndex) => function () {
    //   var response = request(
    //     "get",
    //     `http://localhost:9000/api/matcher/blocks?uid=${users[senderIndex].userid}`,
    //     {
    //       'headers': {
    //         "Content-Type": "application/json",
    //         "Accept": "application/json",
    //         "Authorization": authHeader(users[senderIndex].jwt)
    //       },
    //       'time': true
    //     }
    //   );
    //   // response.then((res) => console.log(res.body));

    //   expect(response).to.have.status(status);
    //   expect(response).to.have.schema({
    //     type: "array",
    //     items: {
    //       type: "object",
    //       properties: {
    //         userid: { type: "integer", minimum: 1 },
    //         login: { type: "string", pattern: "(\\w){1,15}$" },
    //         birthDate: {
    //           description: "Epoch time in milliseconds",
    //           type: "integer"
    //         },
    //         gender: { type: "string", enum: ["male", "female", "other"] },
    //         picture: {
    //           title: "Picture",
    //           type: "object",
    //           properties: {
    //             id: { type: "integer", minimum: 1 },
    //             url: {
    //               type: "string",
    //               pattern:
    //                 "^\\/assets\\/[0-9a-zA-Z]{6,}\\.(jpg|jpeg|gif|JPG|png|PNG)$"
    //             },
    //             dateAdded: {
    //               description: "Epoch time in milliseconds",
    //               type: "integer"
    //             },
    //             ownerID: { type: "integer", minimum: 1 }
    //           },
    //           required: ["id", "url", "dateAdded", "ownerID"]
    //         }
    //       }
    //     }
    //   });
    //   return chakram.wait();
    // };

    // Variations of the like test function
    // const userLikeTest = testLike(204);
    // const userMatchTest = testLike(200);
    const userBlockTest = testBlock(204);
    // const userBlocksTest = testBlocks(200);

    // Create multiple users
    it('(admin) should create 4 confirmed users', async () => {
      var response = request('get', 'http://localhost:9002/user.create?n=4', {
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
    it('(admin) should get these 4 users\'s connection tokens', async () => {
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


    const testDisplay = (status) => (senderIndex, receiverIndex) => function () {
      var response = request('post', 'http://localhost:9000/api/matcher/display', {
        'body': {
          "uid": users[senderIndex].userid,
          "viewedUid": users[receiverIndex].userid
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

    const userDisplayTest = testDisplay(204);

    it('(/matcher/view) perform view from user 0 should view user 1', userDisplayTest(0, 1));
    it('(/matcher/view) perform view from user 0 should view user 2', userDisplayTest(0, 2));
    it('(/matcher/view) perform view from user 0 should view user 3', userDisplayTest(0, 3));
    it('(/matcher/view) perform view from user 1 should view user 0', userDisplayTest(1, 0));
    it('(/matcher/view) perform view from user 2 should view user 0', userDisplayTest(2, 0));
    it('(/matcher/view) perform view from user 3 should view user 0', userDisplayTest(3, 0));
    // 0 blocks 2
    it('(/matcher/block) user 0 should block user 2', userBlockTest(0, 2));
    // 3 blocks 0
    it('(/matcher/block) user 3 should block user 0', userBlockTest(3, 0));

  describe("tests", function() {
    describe("tests for get", function() {
      it('DISPLAYS - should respond 200 for "Ok"', function() {
        var response = request(
          "get",
          `http://localhost:9000/api/matcher/displays?uid=${users[0].userid}`,
          {
            'headers': {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": authHeader(users[0].jwt)
            },
            'time': true
          });

        expect(response).to.have.status(200);
        expect(response).to.have.schema({
          type: "object",
          properties: {
            viewedBy: {
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
                    "type": "integer",
                  },
                  "lastOut": {
                    "description": "Epoch time in milliseconds",
                    "type": "integer",
                  },
                  gender: { type: "string", enum: ["male", "female", "other"] },
                  picture: {
                    title: "Picture",
                    type: "object",
                    properties: {
                      id: { type: "integer", minimum: 1 },
                      url: {
                        type: "string",
                        // pattern:
                        //   "^\\/assets\\/[0-9a-zA-Z]{6,}\\.(jpg|jpeg|gif|JPG|png|PNG)$"
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
            },
            viewed: {
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
                  gender: { type: "string", enum: ["male", "female", "other"] },
                  picture: {
                    title: "Picture",
                    type: "object",
                    properties: {
                      id: { type: "integer", minimum: 1 },
                      url: {
                        type: "string",
                        // pattern:
                        //   "^\\/assets\\/[0-9a-zA-Z]{6,}\\.(jpg|jpeg|gif|JPG|png|PNG)$"
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
            }
          }
        });

        return chakram.wait();
      });

      it('DISPLAYS - should have exactly 1 "viewed" and 1 "viewedBy"', async function () {
        var response = request(
          "get",
          `http://localhost:9000/api/matcher/displays?uid=${users[0].userid}`,
          {
            'headers': {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": authHeader(users[0].jwt)
            },
            'time': true
          });

        const body = (await response).body;
        expect(body.viewed.length).to.equal(1);
        expect(body.viewedBy.length).to.equal(1);

        return chakram.wait();
      });

      it('should respond 400 for "Bad Request: missing parameter"', function() {
        var response = request(
          "get",
          "http://localhost:9000/api/matcher/displays",
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: authHeader(users[0].jwt)
            },
            time: true
          }
        );

        expect(response).to.have.status(400);
        expect(response).to.have.schema({
          type: "object",
          properties: { message: { type: "string" } },
          required: ["message"]
        });
        return chakram.wait();
      });

      it('should respond 401 for "Forbidden (Invalid JWT)"', function() {
        var response = request(
          "get",
          `http://localhost:9000/api/matcher/displays?uid=${users[0].userid}`,
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

      it('should respond 403 for "Unauthorized (Restricted Action)"', function() {
        var response = request(
          "get",
          `http://localhost:9000/api/matcher/displays?uid=${users[1].userid}`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: authHeader(users[0].jwt)
            },
            time: true
          }
        );

        expect(response).to.have.status(403);
        expect(response).to.have.schema({
          type: "object",
          properties: { message: { type: "string" } },
          required: ["message"]
        });
        return chakram.wait();
      });

      // it('should respond 404 for "User Not Found"', function() {
      //   var response = request(
      //     "get",
      //     `http://localhost:9000/api/matcher/displays?uid=0`,
      //     {
      //       headers: {
      //         "Content-Type": "application/json",
      //         Accept: "application/json",
      //         Authorization: authHeader(users[0].jwt)
      //       },
      //       time: true
      //     }
      //   );

      //   expect(response).to.have.status(404);
      //   expect(response).to.have.schema({
      //     type: "object",
      //     properties: { message: { type: "string" } },
      //     required: ["message"]
      //   });
      //   return chakram.wait();
      // });
    });
  });

  describe("(clean up)", function () {
    // Delete users
    it('(admin) should delete all 5 users', () => {
      var response = deleteUsers(users.map(user => user.userid));
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });
});
});
