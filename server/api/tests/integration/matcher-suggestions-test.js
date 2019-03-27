/* eslint-disable */
"use strict";
var mocha = require("mocha");
var chakram = require("chakram");
var request = chakram.request;
var expect = chakram.expect;
const places = require("../../../_common/mock").mockPlaces;

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

// Variables
const baseurl = "http://localhost:9000/api";

/*

  Users sample

  ♡ is main user, A -> L are other users

  . means no reason to filter :
    "geographically close enough"
    "same place"
    "interested in ♡'s gender"
    "what ♡ is looking for"
    "not blocked"
    "not blocked-by"
    "not matched"
    "never viewed"
    "not liked yet"
  x means reason to filter:
    "geographically too far"
    "diff place"
    "not interested in ♡'s gender"
    "not what ♡ is looking for"
    "blocked"
    "blocked-by"
    "matched"
    "recently viewed"
    "recently liked"
    "excluded"
  o (old) || u (un-) mean no reason to filter ANYMORE (for tests):
    "unblocked"
    "unblocked-by"
    "unmatched"
    "viewed a long time ago"
    "liked a long time ago"

  F is a hard filter
  f is a soft (temporary) filter
  . means not filtered

................. | 0 || 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 ||
-----------------------------------------------------------------------------------------------------------------
................. | ♡ || A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R || order to check
location......... | - || x | . | . | . | . | . | . | . | . | . | . | . | . | . | . | . | . | . || 1
place............ | 1 || . | x | . | . | . | . | . | . | . | . | . | . | . | . | . | . | . | . || 1
gender .......... | f || . | . | x | . | . | . | . | . | . | . | . | . | . | . | . | . | . | . || 1
look for......... | m || . | . | . | x | . | . | . | . | . | . | . | . | . | . | . | . | . | . || 1
blocked.......... | - || . | . | . | . | x | . | . | . | . | u | . | u | . | . | . | . | . | . || 1
blocked-by....... | - || . | . | . | . | . | x | . | . | . | . | u | u | . | . | . | . | . | . || 1
matched.......... | - || . | . | . | . | . | . | x | . | . | . | . | . | u | . | . | . | . | . || .2
viewed........... | - || . | . | . | . | . | . | i | x | o | . | . | . | . | o | o | . | . | . || ..3
liked............ | - || . | . | . | . | . | . | i | i | x | . | . | . | o | . | o | . | . | . || ...4
except........... | - || . | . | . | . | . | . | . | . | . | . | . | . | . | . | . | . | x | x || 1
---------------------------------------------------------------------------------------------------------
filtered......... | - || F | F | F | F | F | F | F | f | f | . | . | . | . | . | . | . | . | . |

*/

describe("tests for /matcher/suggestions", function() {
  var users = [];
  describe("(set up)", function() {
    // Create multiple users
    it("(admin) should create 19 confirmed users", async () => {
      var response = request("get", "http://localhost:9002/user.create?n=19", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        time: true
      });
      // Save users
      users = (await response).body.userids;
      // Test
      expect(response).to.have.status(200);
      return chakram.wait();
    });

    it("(admin) should edit all 19 users", async () => {
      // Format the sample
      const TWO_WEEKS = 1.21e9;
      const twoWeeksAgo = Date.now() - TWO_WEEKS;

      users = users.map(uid => {
        return {
          userid: uid,
          place: { id: 1 },
          gender: "male",
          distMax: 5,
          location: {
            lat: "-22.9773065",
            long: "-43.1898984"
          }
        };
      });

      users[0] = {
        ...users[0],
        gender: "female",
        lookfor: {
          male: true,
          female: false,
          other: false
        },
        blocks: [
          {
            userid: users[5].userid // user 5 is blocked
          },
          {
            userid: users[10].userid, // user 10 blocked and unblocked
            unblocked: true
          },
          {
            userid: users[12].userid, // user 12 blocked and unblocked
            unblocked: true
          }
        ],
        likes: [
          {
            userid: users[7].userid // user 7 liked (and matched)
          },
          {
            userid: users[9].userid // user 9 liked
          },
          {
            userid: users[13].userid, // user 13 liked (and matched then unmatched by user 12)
            date: twoWeeksAgo
          },
          {
            userid: users[15].userid, // user 15 liked a long time ago
            date: twoWeeksAgo
          }
        ],
        views: [
          {
            userid: users[8].userid // user 8 viewed
          },
          {
            userid: users[9].userid, // user 9 viewed a long time ago
            date: twoWeeksAgo
          },
          {
            userid: users[14].userid, // user 14 viewed a long time ago
            date: twoWeeksAgo
          },
          {
            userid: users[15].userid, // user 15 viewed a long time ago
            date: twoWeeksAgo
          }
        ]
      };

      // Edit one of the two far away
      users[1] = {
        ...users[1],
        location: {
          lat: "48.8865357",
          long: "2.3418544"
        }
      };

      users[2] = {
        ...users[2],
        place: { id: 2 } // user 1 not in same place
      };

      users[3] = {
        ...users[3],
        lookfor: {
          female: false,
          male: true,
          other: true
        }
      };

      users[4] = {
        ...users[4],
        gender: "female" // user 4 not what main user is looking for
      };

      users[6] = {
        ...users[6],
        blocks: [
          {
            userid: users[0].userid // main user blocked by user 6
          }
        ]
      };

      users[7] = {
        ...users[7],
        likes: [
          {
            userid: users[0].userid // match with user 7
          }
        ]
      };

      users[11] = {
        ...users[11],
        blocks: [
          {
            userid: users[0].userid, // main user blocked by user 11
            unblocked: true // then unblocked
          }
        ]
      };

      users[13] = {
        ...users[13],
        likes: [
          {
            userid: users[0].userid, // match with user 13
            unliked: true, // then unmatch
            date: twoWeeksAgo
          }
        ]
      };

      var response = request("post", "http://localhost:9002/user.edit", {
        body: {
          users: users
        },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        time: true
      });
      // Test
      expect(response).to.have.status(200);
      return chakram.wait();
    });

    // Login and save JWT
    it("(admin) should get main users's connection token", async () => {
      var response = request("post", "http://localhost:9002/user.login", {
        body: {
          ids: [users[0].userid]
        },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        time: true
      });

      users[0].jwt = (await response).body[0].jwt;

      expect(response).to.have.status(200);
      return chakram.wait();
    });
  });

  describe("tests", () => {
    describe("tests for get", function() {
      // Test 401
      it('should respond 401 for "Unauthorized" (no auth header)', function() {
        var response = request(
          "post",
          `${baseurl}/matcher/suggestions?uid=${users[0].userid}`,
          {
            body: {
              place: places[0]
            },
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            time: true
          }
        );

        expect(response).to.have.status(401);
        return chakram.wait();
      });

      // Test 400
      it('should respond 400 for "Bad Request"', function() {
        var response = request("get", `${baseurl}/matcher/suggestions`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authHeader(users[0].jwt)
          },
          time: true
        });

        expect(response).to.have.status(400);
        expect(response).to.have.schema({
          type: "object",
          properties: {
            message: {
              type: "string"
            }
          },
          required: ["message"]
        });
        return chakram.wait();
      });

      // Test 200
      it('should respond 200 for "Ok"', async () => {
        var response = request(
          "get",
          `${baseurl}/matcher/suggestions?uid=${users[0].userid}`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: authHeader(users[0].jwt)
            },
            time: true
          }
        );

        expect(response).to.have.status(200);
        expect(response).to.have.schema({
          type: "array",
          items: {
            type: "object",
            properties: {
              userid: { type: "integer", minimum: 1 },
              lastViewed: { type: "number" },
              lastLiked: { type: "number" },
              lastIn: { type: "number" },
              profileSummary: {
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
                        type:
                          "string" /*,"pattern":"^\\/assets\\/[0-9a-zA-Z]{6,}\\.(jpg|jpeg|gif|JPG|png|PNG)$"*/
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
            required: ["userid", "lastIn", "profileSummary"]
          }
        });
        return chakram.wait();
      });

      // Test right result
      it("should respond with the correct users (supposes empty database before test)", async () => {
        var response = request(
          "get",
          `${baseurl}/matcher/suggestions?uid=${users[0].userid}&n=20&filterView&filterLike&filterDist&except=[${[users[17].userid, users[18].userid]}]`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: authHeader(users[0].jwt)
            },
            time: true
          }
        );

        const selectUid = el => el.userid;
        const returnedIds = (await response).body.map(selectUid);
        const notFiltered = users.slice(10).map(selectUid).filter(id => (id !== users[17].userid && id !== users[18].userid));

        expect(returnedIds).to.deep.equal(notFiltered);
        return chakram.wait();
      });

      // Test 403
      it('should respond 403 for "Forbidden"', function() {
        var response = request(
          "get",
          `${baseurl}/matcher/suggestions?uid=${users[1].userid}`,
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
          properties: {
            message: {
              type: "string"
            }
          },
          required: ["message"]
        });
        return chakram.wait();
      });
    });
  });

  describe("(clean up)", () => {
    // Delete users
    it("(admin) should delete the 19 users", () => {
      var response = deleteUsers(users.map(u => u.userid));
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });
});
