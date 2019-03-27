const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'db',
  password: process.env.MATCHA_PG_PWD,
  database: 'postgres',
  port: 5432
});

module.exports = {
  query: (stmt, callback) => pool.query(stmt, callback)
};
