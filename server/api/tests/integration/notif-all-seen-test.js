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
  const userNotify = devAdmin.userNotify;
  // Random user creator
  const randomUser = require("../.test-utils/random-user");
  const registerUser = randomUser.registerUser;
  const createRandomUser = randomUser.createRandomUser;

  // Auth header creator
  const authHeader = require("../../../_common/auth-header");

  // Create users
  var user = createRandomUser();
  var user2 = createRandomUser();

  describe("tests for /notif/all-seen", function() {
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

//////////////////////////////////////////////////////

    // make them like each others
    it('make them like each others', function () {
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

    // CREATE NOTIFICATION...
    it('create notifications...', async () => {
        var notifications = await userNotify([
          {
            receiver: user2.userid,
            type: 'like',
            sender: user.userid,
            created: Date.now()
          },
          {
            receiver: user.userid,
            type: 'match',
            sender: user2.userid,
            created: Date.now()
          },
          {
            receiver: user2.userid,
            type: 'like',
            sender: user.userid,
            created: Date.now()
          },
          {
            receiver: user2.userid,
            type: 'like',
            sender: user.userid,
            created: Date.now()
          },
        ])
        expect(notifications).to.have.status(204);
        return chakram.wait();
    });

         ///////////////////////////////////////////////////////////

         it('TEST THE get - should respond 200 for "Ok"', function() {
          var response = request(
            "get",
            "http://localhost:9000/api/notif/all-seen",
            {
              body: {
                userid: user.userid
              },
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: authHeader(user.jwt)
              },
              time: true
            }
          );
          // response.then((res) => { console.log(res.body); });
          expect(response).to.have.status(200);
          expect(response).to.have.schema({
            type: "array",
            items: {
              type: "object",
              properties: {
                receiver: { type: "integer" },
                notif: { type: "string" },
                infos: "object",
                  properties: {
                    sender: { type: "integer" },
                    created: { type: "integer" },
                  }
                }
              }
          });
          return chakram.wait();
        });

        it('TEST THE get - should respond 401 for "Forbidden (Invalid JWT)"', function() {
          var response = request(
            "get",
            "http://localhost:9000/api/notif/all-seen",
            {
              body: {
                userid: user.userid
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

    ///////////////////////////////////////////////////////////

    it('TEST THE PUT - should respond 204 for "Ok"', function() {
      var response = request(
        "put",
        "http://localhost:9000/api/notif/all-seen",
        {
          body: {
            userid: user.userid
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authHeader(user.jwt)
          },
          time: true
        }
      );
      // response.then((res) => { console.log(res); });
      expect(response).to.have.status(204);
      return chakram.wait();
    });

    it('TEST THE PUT - should respond 400 for "Bad Request: missing parameter"', function() {
      var response = request(
        "put",
        "http://localhost:9000/api/notif/all-seen",
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

    it('TEST THE PUT - should respond 401 for "Forbidden (Invalid JWT)"', function() {
      var response = request(
        "put",
        "http://localhost:9000/api/notif/all-seen",
        {
          body: {
            userid: user.userid
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

    // it('should respond 404 for "Message Not Found"', function() {
    //   var response = request(
    //     "put",
      // "http://localhost:9000/api/notif/all-seen",
    //     {
      // body: {
      //   userid: user.userid
      // },
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

                /////////////////////////////////////
        // test after block


    // CREATE NOTIFICATION...
    it('create notifications...', async () => {
      var notifications = await userNotify([
        {
          receiver: user2.userid,
          type: 'like',
          sender: user.userid,
          created: Date.now()
        },
        {
          receiver: user.userid,
          type: 'match',
          sender: user2.userid,
          created: Date.now()
        },
        {
          receiver: user2.userid,
          type: 'like',
          sender: user.userid,
          created: Date.now()
        },
        {
          receiver: user2.userid,
          type: 'like',
          sender: user.userid,
          created: Date.now()
        },
      ])
      expect(notifications).to.have.status(204);
      return chakram.wait();
  });

            //post block
            it('user blocks user2 - should respond 204 for "Ok"', function () {
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


         it('TEST THE get - should respond 200 for "Ok" but be empty', function() {
          var response = request(
            "get",
            "http://localhost:9000/api/notif/all-seen",
            {
              body: {
                userid: user.userid
              },
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: authHeader(user.jwt)
              },
              time: true
            }
          );
          // response.then((res) => { console.log(res.body); });

          expect(response).to.have.status(200);
          expect(response).to.have.schema({
            type: "array",
            items: {
              type: "object",
              properties: {
                receiver: { type: "integer" },
                notif: { type: "string" },
                infos: "object",
                  properties: {
                    sender: { type: "integer" },
                    created: { type: "integer" },
                  }
                }
              }
          });
          return chakram.wait();
        });


    //     //////////////

    it('TEST THE PUT - should respond 204 for "Ok" but did nothing', function() {
      var response = request(
        "put",
        "http://localhost:9000/api/notif/all-seen",
        {
          body: {
            userid: user.userid
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authHeader(user.jwt)
          },
          time: true
        }
      );
      // response.then((res) => { console.log(res); });
      expect(response).to.have.status(204);
      return chakram.wait();
    });

    it('user Unblocks user2 - should respond 204 for "Ok"', function() {
      var response = request(
        "put",
        "http://localhost:9000/api/matcher/unblock",
        {
          body: {
            uid: user.userid,
            unblock_uid: user2.userid
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authHeader(user.jwt)
          },
          time: true
        }
      );

      expect(response).to.have.status(204);
      return chakram.wait();
    });

    it('TEST THE PUT - should respond 204 for "Ok"', function() {
      var response = request(
        "put",
        "http://localhost:9000/api/notif/all-seen",
        {
          body: {
            userid: user.userid
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authHeader(user.jwt)
          },
          time: true
        }
      );
      // response.then((res) => { console.log(res); });
      expect(response).to.have.status(204);
      return chakram.wait();
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
});

