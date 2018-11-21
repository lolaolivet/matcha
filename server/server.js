const express = require('express');
const app = express();
// const server = require('http').createServer(app);
const { Client, Pool } = require('pg');
const conString = "postgres://lolivet:lolivet@localhost:5432/db_matcha";
// const router = express.Router();
// const bodyParser = require ('body-parser');

// app.use(bodyParser.urlencoded({ extended: true}));
// app.use(bodyParser.json());

const pool = new Pool({
  user: 'lolivet',
  host: 'localhost',
  database: 'db_matcha',
  password: 'lolivet',
  port: 5432,
})

const client = new Client({
  user: 'lolivet',
  host: 'localhost',
  database: 'db_matcha',
  pssword: 'lolivet',
  port: 5432,
})

client.connect((err) => {
  if (err) {
    console.log('Connection error: ', err);
  } else {
    console.log('Connected');
  }
});


app.get('/users', (req, res) => {
  let fields = [];
  pool.query('SELECT * FROM users WHERE id = 1', (err, results) => {
    if (err) throw err;
    fields = results.rows;
    res.send(fields);
  })
  // res.end();
  // pool.end();

})


// app.get('/demo', (req, res) => {
//   res.send('Page demo');
// })
//
// app.post('/', (req, res) => {
//   // Traitement des donnees
// })

app.listen(3001);
