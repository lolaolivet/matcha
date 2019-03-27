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
const endpath = 'stats';

describe('tests for /users/{userid}/stats', function () {
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

    it('should respond 404 for "User Not Found"', function () {
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

    it('should respond 200 for "OK"', function () {
      var response = request('get', `${baseurl}/${user.userid}/${endpath}`, {
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authHeader(user.jwt)
        },
        'time': true
      });

      expect(response).to.have.status(200);
      expect(response).to.have.schema({
        'type': 'object',
        'properties': {
          'views': {
            'type': 'array',
            'items': {
              'type': 'number'
            }
          },
          'likes': {
            'type': 'array',
            'items': {
              'type': 'object',
              'properties': {
                'profile': {
                  'type': 'object',
                  'properties': {
                    'userid': {
                      'type': 'integer',
                      'minimum': 1
                    },
                    'login': {
                      'type': 'string',
                      'pattern': '(\\w){1,15}$'
                    },
                    'birthDate': {
                      'description': 'Epoch time in milliseconds',
                      'type': 'integer',
                      'minimum': 154306835
                    },
                    'gender': {
                      'type': 'string',
                      'enum': ['male', 'female', 'other']
                    },
                    'picture': {
                      'title': 'Picture',
                      'type': 'object',
                      'properties': {
                        'id': {
                          'type': 'integer',
                          'minimum': 1
                        },
                        'path': {
                          'type': 'string',
                          'pattern': '^\\/assets\\/[0-9a-zA-Z]{6,}\\.(jpg|jpeg|gif|JPG|png|PNG)$'
                        },
                        'dateAdded': {
                          'description': 'Epoch time in milliseconds',
                          'type': 'integer',
                          'minimum': 154306835
                        },
                        'ownerID': {
                          'type': 'integer',
                          'minimum': 1
                        }
                      },
                      'required': ['id', 'path', 'dateAdded', 'ownerID']
                    }
                  }
                },
                'date': {
                  'description': 'Epoch time in milliseconds',
                  'type': 'integer',
                  'minimum': 154306835
                },
                'quantity': {
                  'type': 'integer'
                }
              }
            }
          },
          'matches': {
            'type': 'array',
            'items': {
              'type': 'object',
              'properties': {
                'profile': {
                  'type': 'object',
                  'properties': {
                    'userid': {
                      'type': 'integer',
                      'minimum': 1
                    },
                    'login': {
                      'type': 'string',
                      'pattern': '(\\w){1,15}$'
                    },
                    'birthDate': {
                      'description': 'Epoch time in milliseconds',
                      'type': 'integer',
                      'minimum': 154306835
                    },
                    'gender': {
                      'type': 'string',
                      'enum': ['male', 'female', 'other']
                    },
                    'picture': {
                      'title': 'Picture',
                      'type': 'object',
                      'properties': {
                        'id': {
                          'type': 'integer',
                          'minimum': 1
                        },
                        'path': {
                          'type': 'string',
                          'pattern': '^\\/assets\\/[0-9a-zA-Z]{6,}\\.(jpg|jpeg|gif|JPG|png|PNG)$'
                        },
                        'dateAdded': {
                          'description': 'Epoch time in milliseconds',
                          'type': 'integer',
                          'minimum': 154306835
                        },
                        'ownerID': {
                          'type': 'integer',
                          'minimum': 1
                        }
                      },
                      'required': ['id', 'path', 'dateAdded', 'ownerID']
                    }
                  }
                },
                'date': {
                  'description': 'Epoch time in milliseconds',
                  'type': 'integer',
                  'minimum': 154306835
                }
              }
            }
          }
        }
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