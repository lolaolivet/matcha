const format = require('pg-format');
const db = require('../common/db');

const insertIntoTable = (table, object) => {
  let keys = Object.keys(object);
  let values = [];
  keys.forEach((elem) => {
    values.push(object[elem]);
  });
  let request = format(`INSERT INTO ${table} (%s) VALUES (%L) RETURNING *;`, keys, values);
  return (db.query(request));
};

module.exports = { insertIntoTable };
