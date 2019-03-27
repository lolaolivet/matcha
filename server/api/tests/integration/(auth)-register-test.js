/* eslint-disable */
'use strict';
var mocha = require('mocha');
var chakram = require('chakram');
var request = chakram.request;
var expect = chakram.expect;

// Admin
const devAdmin = require('../.test-utils/dev-admin');
const deleteUsers = devAdmin.deleteUsers;

function createName (len) {
  var text = '';
  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < len; i++)
    text += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  return text;
}

const randomUser = require('../.test-utils/random-user');
const createRandomUser = randomUser.createRandomUser;


var url = 'http://localhost:9000/api/register';

describe('tests for /register', function () {

  var userid;
  var name = createName(10);
  var validUser = createRandomUser();

  describe('tests for post', function () {
    it('should respond 200 for "Ok"', function () {
      var response = request('post', url, {
        'body': validUser,
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        'time': true
      });

      response.then((res) => {
        userid = res.body.userid;
        return (Promise.resolve(res));
      });

      expect(response).to.have.status(200);
      return chakram.wait();
    });

    it('should respond 400 for "Bad Request"', function () {
      var response = request('post', url, {
        'body': {
          'firstname': 'john'
        },
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        'time': true
      });

      expect(response).to.have.status(400);
      expect(response).to.have.schema({
        'type': 'object',
        'properties': {
          'message': {
            'type': 'string'
          }
        },
        'required': ['message']
      });
      return chakram.wait();
    });

    it('should respond 409 for "Conflict"', function () {
      var response = request('post', url, {
        'body': validUser,
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        'time': true
      });

      expect(response).to.have.status(409);
      expect(response).to.have.schema({
        'type': 'object',
        'properties': {
          'message': {
            'type': 'string'
          }
        },
        'required': ['message']
      });
      return chakram.wait();
    });

    // Delete users
    it('(admin) should delete user', () => {
      var response = deleteUsers(userid);
      expect(response).to.have.status(204);
      return chakram.wait();
    });
  });
});