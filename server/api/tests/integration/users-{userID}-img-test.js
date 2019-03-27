/* eslint-disable */

'use strict';
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

// valid status
const testStatus = (status) => async (res) => {
  // Check for the status with chai
  chai.expect(res.status).to.equal(status);
  return (res);
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
// //////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////

var sendImage;

describe('tests for /users/{userid}/img', function () {

  describe('tests for post', function () {

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

    // Test 401
    it('should respond 401 for "Unauthorized" (no auth header)', function () {
      var dir = '.test-images';
      var filename = '2.png';

      return (
        userSendImage(user.userid)(dir, filename)
        .then(testStatus(401))
      );
    });

    it('should respond 201 for "Created" for 1 files', function () {
      var dir = '.test-images';
      var filename = '2.png';

      return (
        sendImage(dir, filename)
        .then(testStatus(201))
        .then((res) => res.json())
        .then(testResponseSchemaOK)
      );
    });

    it('should respond 201 for "Created" for 3 files', function () {
      var dir = '.test-images';
      var filename = '1.png';
      var number = 3;

      return (
        sendImage(dir, filename, number)
        .then(testStatus(201))
        .then((res) => res.json())
        .then(testResponseSchemaOK)
      );
    });

    it('should respond 422 for "Unprocessable Entity" (invalid file)', function () {
      var dir = '.test-images'
      var filename = 'invalid.yml';

      return (
        sendImage(dir, filename)
        .then(testStatus(422))
        .then((res) => res.json())
        .then(testResponseSchemaError)
      );
    });

    it('should respond 422 for "Unprocessable Entity" (heavy file)', function () {
      var dir = '.test-images'
      var filename = 'size5mb.jpg';

      return (
        sendImage(dir, filename)
        .then(testStatus(422))
        .then((res) => res.json())
        .then(testResponseSchemaError)
      );
    });

    it('should respond 422 for "Unprocessable Entity" (too many files)', function () {
      var dir = '.test-images'
      var filename = '3.jpg';
      var number = 6;

      return (
        sendImage(dir, filename, number)
        .then(testStatus(422))
        .then((res) => res.json())
        .then(testResponseSchemaError)
      );
    });

    it('should respond 400 for "No files provided"', function () {
      // Create a multipart form
      var form = new FormData();

      return (
        fetch(`http://localhost:9000/api/users/${user.userid}/img`, {
          method: 'POST',
          body: form,
          headers: {
            "Authorization": authHeader(user.jwt)
          }
        })
        .then(testStatus(400))
        .then((res) => res.json())
        .then(testResponseSchemaError)
      );
    });

    it('should respond 400 for "Missing header"', function () {
      var response = request('post', `http://localhost:9000/api/users/${user.userid}/img`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
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

    it('should respond 404 for "User Not Found"', function () {
      var response = request('post', `http://localhost:9000/api/users/${ user.userid + 100 }/img`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'time': true
      });

      expect(response).to.have.status(404);
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

    // Delete users
    it('(admin) should delete user', () => {
      var response = deleteUsers(user.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });

  describe('tests for get', function () {
    var images;

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

    it('(prerequisite) should add 5 images to user', function () {
      var dir = '.test-images';
      var filename = '1.png';
      var number = 5;

      return (
        sendImage(dir, filename, number)
        .then(testStatus(201))
        .then((res) => res.json())
        .then((json) => {
          images = json;
          return (json);
        })
        .then(testResponseSchemaOK)
      );
    });

    it('should respond 401 for "Unauthorized" (no auth header)', function () {
      var response = request('get', `http://localhost:9000/api/users/${user.userid}/img`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      expect(response).to.have.status(401);
      return chakram.wait();
    });

    it('should respond 200 for "Success"', function () {
      var response = request('get', `http://localhost:9000/api/users/${user.userid}/img`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        }
      });

      expect(response).to.have.status(200);
      expect(response).to.have.schema(schema);
      return chakram.wait();
    });

    it('should respond 404 for "User Not Found"', function () {
      var response = request('delete', 'http://localhost:9000/api/users/0/img', {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'time': true
      });

      expect(response).to.have.status(404);
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

    // Delete users
    it('(admin) should delete user', async () => {
      var response = deleteUsers(user.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });

  describe('tests for delete', function () {
    var ids = [];
    var user = createRandomUser();


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

    it('(prerequisite) should add 5 images to user', function () {
      var dir = '.test-images';
      var filename = '1.png';
      var number = 5;

      return (
        sendImage(dir, filename, number)
        .then(testStatus(201))
        .then((res) => res.json())
        .then((json) => {
          // map the ids;
          json.map((image) => ids.push(image.id));
          return (json);
        })
        .then(testResponseSchemaOK)
      );
    });

    it('should respond 401 for "Unauthorized" (no auth header)', function () {
      var response = request('delete', `http://localhost:9000/api/users/${user.userid}/img`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        'body': {
          ids: ids.slice(2, 4)
        }
      });

      expect(response).to.have.status(401);
      return chakram.wait();
    });

    it('should respond 403 for "Forbidden (images don\'t belong to user)"', function () {
      var response = request('delete', `http://localhost:9000/api/users/${user.userid}/img`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'body': {
          ids: ids.map(id => (id + 10))
        }
      });

      expect(response).to.have.status(403);
      return chakram.wait();
    });

    it('should respond 202 for "Success (Empty)" (array of ids)', function () {
      var response = request('delete', `http://localhost:9000/api/users/${user.userid}/img`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'body': {
          ids: ids.slice(2, 4)
        }
      });

      expect(response).to.have.status(202);
      return chakram.wait();
    });

    it('should respond 403 for "Forbidden" (deleting main image)', function () {
      var response = request('delete', `http://localhost:9000/api/users/${user.userid}/img`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'body': {
          ids: ids[0]
        }
      });

      expect(response).to.have.status(403);
      return chakram.wait();
    });

    it('should respond 202 for "Success (Empty)" (single id)', function () {
      var response = request('delete', `http://localhost:9000/api/users/${user.userid}/img`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },  
        'body': {
          ids: ids[1]
        }
      });  

      expect(response).to.have.status(202);
      return chakram.wait();
    });  

    it('should respond 400 for "Bad Request"', function () {
      var response = request('delete', `http://localhost:9000/api/users/${user.userid}/img`, {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
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

    it('should respond 404 for "User Not Found"', function () {
      var response = request('delete', 'http://localhost:9000/api/users/0/img', {
        'headers': {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader(user.jwt)
        },
        'time': true
      });

      expect(response).to.have.status(404);
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

    // Delete users
    it('(admin) should delete user', async () => {
      var response = deleteUsers(user.userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });
});
