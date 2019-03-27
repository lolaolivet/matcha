const express = require('express');
const bodyParser = require('body-parser');
const app = express();
var cors = require('cors');

const config = require('./common/config.js');

app.use(cors());

app.use(bodyParser.json({
  limit: config['maxPayloadSize']
}));
app.use(bodyParser.urlencoded({
  limit: config['maxPayloadSize'],
  extended: true
}));

app.use('/static', express.static('./static'));

const router = require('./router');

app.use('/', (req, res, next) => {
  var id =
    req.headers['x-user-id'] === 'admin'
      ? undefined
      : parseInt(req.headers['x-user-id']);
  req.user = { id };
  next();
}, router);

app.listen(process.env.MAIN_PORT, () => {
  console.log('matcher listening on port ' + process.env.MAIN_PORT);
});
