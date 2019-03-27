/* eslint-disable */
"use strict";
const fetch = require('node-fetch');
const FormData = require('form-data');
const mocha = require('mocha');
const chakram = require('chakram');
const request = chakram.request;
const expect = chakram.expect;
const fs = require('fs');


// Random user creator
const randomUser = require('../.test-utils/random-user');
const registerUser = randomUser.registerUser;
const createRandomUser = randomUser.createRandomUser;

// Admin
const devAdmin = require('../.test-utils/dev-admin');
const confirmUser = devAdmin.confirmUser;
const deleteUsers = devAdmin.deleteUsers;

// Auth header creator
const authHeader = require('../../../_common/auth-header');

const chai = require('chai');
const chaiHttp = require('chai-http');
const tv4 = require('tv4');
chai.use(chaiHttp);

const createFileStream = (dir, filename) => {
  return (fs.createReadStream(`${__dirname}/${dir}/${filename}`));
};

const createImageForm = (files) => {
  // Create a multipart form
  var form = new FormData();
  for (let i in files) {
    let file = files[i];
    // NB: server expects all images to be labeled "image"
    form.append('image', file);
  }
  return (form);
}

const userSendImage = (userid, jwt) => (dir, filename, n = 1) => {
  // Create file stream
  var file = createFileStream(dir, filename);
  // Create image form
  var form = createImageForm(Array(n).fill(file));
  // Send the form
  return (
    fetch(`http://localhost:9000/api/users/${userid}/img`, {
      method: 'POST',
      body: form,
      headers: {
        Authorization: authHeader(jwt)
      }
    })
  );
};

const testSchema = (schema) => (json) => {
  // Using classical rejection to get a more useful error message in the trace
  if (!tv4.validate(json, schema)) {
    return Promise.reject(new Error(tv4.error.message));
  }
  return Promise.resolve();
};

const schema = {
  "type": "array",
  "maxItems": 5,
  "items": {
    "type": "object",
    "properties": {
      "picture": {
        "title": "Picture",
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "minimum": 1
          },
          "path": {
            "type": "string",
            "pattern": "^\\/assets\\/[0-9a-zA-Z]{6,}\\.(jpg|jpeg|gif|JPG|png|PNG)$"
          },
          "dateAdded": {
            "description": "Epoch time in milliseconds",
            "type": "integer",
            "minimum": 154306835
          },
          "ownerID": {
            "type": "integer",
            "minimum": 1
          }
        },
        "required": ["id", "path", "dateAdded", "ownerID"]
      }
    }
  }
};

const testResponseSchemaOK =
  // expected schema for the response
  testSchema(schema);

const testResponseSchemaError =
  // expected schema for the response
  testSchema({
    "type": "object",
    "properties": {
      "message": {
        "type": "string"
      }
    },
    "required": ["message"]
  });

// //////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////

var sendImage;

describe("tests for /users/{userid}/img", function () {
  describe("tests for put", function () {

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
        // Use the userid and the jwt to create the sendImage function
        sendImage = userSendImage(user.userid, user.jwt);
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

    // create second user

    var user2 = createRandomUser();

    it('(prerequisite) should register user2', () => {
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
    it('(admin) should confirm user2', () => {
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
        // Use the userid and the jwt to create the sendImage function
        sendImage = userSendImage(user2.userid, user2.jwt);
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
    //

    var imageId;

    it('creation of 1 files', async function () {
      var dir = '.test-images';
      var filename = '2.png';

      imageId = (await sendImage(dir, filename)
        .then((res) => {
          return (res.json());
        }))[0].id;
    });

    // //////////////////////////////////////////////////////////////
    // //////////////////////////////////////////////////////////////
    // //////////////////////////////////////////////////////////////

    it('a first time to test initialize - should respond 204 for "Ok"', async function () {
      // await console.log(imageId);
      var response = request(
        "put",
        `http://localhost:9000/api/users/${user.userid}/img`, {
          'body': {
            'imageId': imageId,
            'ownerId': user.userid
          },
          'headers': {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": authHeader(user.jwt)
          },
          time: true
        }
      );
      // response.then(res => console.log(res.body));
      // response.then((res) => { console.log(imageId); });
      expect(response).to.have.status(204);
      return chakram.wait();
    });
    it('a second time to test cancel - should respond 204 for "Ok"', async function () {
      // await console.log(imageId);
      var response = request(
        "put",
        `http://localhost:9000/api/users/${user.userid}/img`, {
          'body': {
            'imageId': imageId,
            'ownerId': user.userid
          },
          'headers': {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": authHeader(user.jwt)
          },
          time: true
        }
      );
      // response.then(res => console.log(res.body));
      // response.then((res) => { console.log(imageId); });
      expect(response).to.have.status(204);
      return chakram.wait();
    });
    it('a third time to test reset - should respond 204 for "Ok"', async function () {
      // await console.log(imageId);
      var response = request(
        "put",
        `http://localhost:9000/api/users/${user.userid}/img`, {
          'body': {
            'imageId': imageId,
            'ownerId': user.userid
          },
          'headers': {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": authHeader(user.jwt)
          },
          time: true
        }
      );
      // response.then(res => console.log(res.body));
      // response.then((res) => { console.log(imageId); });
      expect(response).to.have.status(204);
      return chakram.wait();
    });

    it('should respond 400 for "Bad Request"', function () {
      var response = request(
        "put",
        `http://localhost:9000/api/users/${user.userid}/img`, {
          'body': {
            ownerId: user.userid
          },
          'headers': {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": authHeader(user.jwt)
          },
          time: true
        }
      );

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

    it('should respond 401 for "Forbidden (Invalid JWT)"', function () {
      var response = request(
        "put",
        `http://localhost:9000/api/users/${user.userid}/img`, {
          'body': {
            'imageId': imageId,
            'ownerId': user.userid
          },
          'headers': {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": ""
          },
          time: true
        }
      );

      expect(response).to.have.status(401);
      return chakram.wait();
    });

    it('should respond 403 for "Unauthorized (Restricted Action)"', function () {
      var response = request(
        "put",
        `http://localhost:9000/api/users/${user.userid}/img`, {
          'body': {
            'imageId': imageId,
            'ownerId': user2.userid
          },
          'headers': {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": authHeader(user.jwt)
          },
          time: true
        }
      );

      expect(response).to.have.status(403);
      return chakram.wait();
    });

    // it('should respond 404 for "Not Found"', function() {
    //   var response = request(
    //     "put",
    //     `http://localhost:9000/api/users/${user.userid + 100}/img`,
    //     {
    //       'body' : {
    //         imageId: imageId + 100,
    //         ownerId: user.userid
    //       },
    //       'headers': {
    //         "Content-Type": "application/json",
    //         "Accept": "application/json",
    //         "Authorization": authHeader(user.jwt)
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

    // Delete users
    it('(admin) should delete user', () => {
      var response = deleteUsers(user.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
    // Delete users
    it('(admin) should delete user', () => {
      var response = deleteUsers(user2.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });
});
