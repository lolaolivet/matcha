const { Pool } = require('pg');
const userCreator = require('./user-creator.js');
const format = require('pg-format');

const initPool = new Pool({
  user: 'postgres',
  host: 'db',
  password: 'example',
  database: 'postgres',
  port: 5432
});

const findUser = (table) => (key) => (value) => {
  let stmt;
  let request;

  stmt = `SELECT * FROM ${table} WHERE ${key} = %L;`;
  request = format(stmt, value);
  return (initPool.query(request));
};

const findUserInAuth = findUser('user_auth');
const findUserAuthByEmail = findUserInAuth('user_email');

const userExists = async (table, key, value) => {
  return (
    (await findUser(table)(key)(value)).rowCount > 0
  );
};

const insertIntoTable = (table, object, returning) => {
  let keys = Object.keys(object);
  let values = [];
  keys.forEach((elem) => {
    values.push(object[elem]);
  });
  let request = format(`INSERT INTO ${table} (%s) VALUES (%L) ${returning ? 'RETURNING ' + returning : ''};`, keys, values);
  return (initPool.query(request));
};

const dateFromUTCString = (d) => {
  var year = parseInt(d.slice(0, 4));
  var mon = parseInt(d.slice(5, 7));
  var day = parseInt(d.slice(8, 10));
  var h = parseInt(d.slice(11, 13));
  var min = parseInt(d.slice(14, 16));
  var sec = parseInt(d.slice(17, 19));
  return (new Date(Date.UTC(year, mon, day, h, min, sec)));
};

const feedDB = async function (nbUser) {
  const fakeUsers = await userCreator.create(nbUser);
  const count = Object.keys(fakeUsers).length;
  let ids = [];
  let j;

  for (j = 0; j < count; j++) {
    let auth = fakeUsers[j]['user_auth'];
    let profile = fakeUsers[j]['user_info'];
    let images = fakeUsers[j]['images'];

    if (profile.dob) {
      profile.dob = dateFromUTCString(profile.dob.toString()).getTime();
    }
    if (profile.created) {
      profile.created = dateFromUTCString(profile.created.toString()).getTime();
    }
    if (!(await userExists('user_auth', 'user_email', auth.user_email))) {
      await insertIntoTable('user_auth', auth);
    }

    let rows = (await (findUserAuthByEmail(auth.user_email))).rows;
    if (rows.length === 0) throw (new Error(`No user with email ${auth.user_email} in table.`));
    if (rows.length !== 1) throw (new Error(`User with email ${auth.user_email} appears twice in the table, this should not happen.`));
    let user = rows[0];
    profile['user_id'] = user['user_id'];
    profile['last_out'] = Date.now();
    profile['last_in'] = (Date.now() - 5000);
    ids.push(user['user_id']); // Save the id
    images.map(im => {
      im['owner_id'] = user['user_id'];
      im['main_pic'] = true;
    });
    for (let n in images) await insertIntoTable('images', images[n]);

    if (!(await userExists('user_info', 'user_id', profile['user_id']))) {
      await insertIntoTable('user_info', profile);
      await insertIntoTable('user_preferences', { 'user_id': user['user_id'] });
    }
  }

  return (ids);
};

module.exports = feedDB;
