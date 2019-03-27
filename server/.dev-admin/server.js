const express = require('express');
const app = express();
const create = require('./routes/user.create');
const edit = require('./routes/user.edit');
const login = require('./routes/user.login');
const confirm = require('./routes/user.confirm');
const deleteUsers = require('./routes/user.delete');
const flushUsers = require('./routes/user.flush');
const userCode = require('./routes/user.code');
const userLog = require('./routes/user.log');
const userSpeaks = require('./routes/user.speak');
const userNotify = require('./routes/user.notif');
const userFill = require('./routes/user.fill');
const userTime = require('./routes/user.time');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use('/user.create', create);
app.use('/user.edit', edit);
app.use('/user.login', login);
app.use('/user.confirm', confirm);
app.use('/user.log', userLog);
app.delete('/user.delete', deleteUsers);
app.get('/user.flush', flushUsers);
app.get('/user.code', userCode);
app.use('/user.speak', userSpeaks);
app.use('/user.notif', userNotify);
app.use('/user.fill', userFill);
app.use('/user.time', userTime);

app.listen(process.env.MAIN_PORT, () => {
  console.log('dev-admin listening on port ' + process.env.MAIN_PORT);
});
