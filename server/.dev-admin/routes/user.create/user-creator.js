const https = require('https');
const bcrypt = require('bcryptjs');

const formatUser = (user, hashPwd) => {
  return ({
    'user_auth': {
      'user_email': user.email,
      'user_password': hashPwd,
      'user_login': user.login.username,
      'confirmed': true
    },
    'user_info': {
      'lastname': user.name.last,
      'firstname': user.name.first,
      'dob': user.dob.date,
      'gender': Math.random() < .05 ? 'other' : user.gender,
      'created': user.registered.date,
      'score': 0
    },
    'images': [{
      'image_path': user.picture.large,
      'image_name': '',
      'created': Date.now(),
      'owner_id': ''
    }]
  });
};

const getUsers = (nbUser = 1, pwd = 'Qwerty123') => {
  return (new Promise((resolve, reject) => {
    https.get(`https://api.randomuser.me/?nat=au,br,ca,de,es,fr,gb,ie,no,nl,nz,us,gb&results=${nbUser}&exc=cell,phone`, (resp) => {
      let ret = [];
      resp.on('data', (chunk) => {
        ret += chunk;
      });

      resp.on('end', async () => {
        const response = JSON.parse(ret);
        const users = response.results;
        const hashPwd = await bcrypt.hash(pwd, 8);
        const data = [];

        for (let i = 0; i < users.length; i++) {
          let user = formatUser(users[i], hashPwd);
          data.push(user);
        }

        resolve(data);
      });
    }).on('error', reject);
  }));
};

module.exports = { create: getUsers };
