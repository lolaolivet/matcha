'use strict';
const chakram = require('chakram');
const request = chakram.request;

const confirmUser = (userid) => {
  return request('post', 'http://localhost:9002/user.confirm', {
    'body': {
      id: userid
    },
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    'time': true
  });
}
const deleteUsers = (userids) => {
  if (!(userids instanceof Array)) {
    userids = [userids];
  }
  return request('delete', 'http://localhost:9002/user.delete', {
    'body': {
      ids: userids
    },
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    'time': true
  });
}

const userPwdCode = (userid) => {
  return request('get', `http://localhost:9002/user.code?uid=${userid}&token=pwd`, {
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    'time': true
  });
}

const userConfirmCode = (userid) => {
  return request('get', 'http://localhost:9002/user.code?uid=' + userid, {
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    'time': true
  });
}

const userSpeaks = (msgs) => {
  return request('post', 'http://localhost:9002/user.speak', {
    'body': {
      messages: msgs
    },
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    'time': true    
  });
}
const userNotify = (notif) => {
  return request('post', 'http://localhost:9002/user.notif', {
    'body': {
      notifications: notif
    },
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    'time': true    
  });
}

module.exports = {
  confirmUser,
  deleteUsers,
  userSpeaks,
  userConfirmCode,
  userPwdCode,
  userNotify
};
