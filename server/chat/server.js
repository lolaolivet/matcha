const app = require('express')();
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const { onMessage } = require('./messages');
const { onSeen } = require('./seen');
const online = require('./online');
const offline = require('./offline');
const notifRouter = require('./notifications').router;
var cors = require('cors');
const io = require('socket.io')(http, { origins: '*:*' });
const jsonwebtoken = require('jsonwebtoken');
const SECRET_KEY = process.env.MATCHA_SECRET;

app.use(cors());

io.use((socket, next) => {
  if (!socket.handshake.query || !socket.handshake.query.token) {
    return next(new Error('Authentication error'));
  }
  jsonwebtoken.verify(socket.handshake.query.token, SECRET_KEY, (err, decodedToken) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    // Save the token
    socket.token = {
      decoded: decodedToken,
      jwt: socket.handshake.query.token,
    };
    // Next
    next();
  });
}).on('connection', async (socket) => {
  var userid = socket.token.decoded.id;
  online(userid, socket)();

  // Set up the online handler
  socket.on('online', online(userid, socket));
  // Set up the offline handler
  socket.on('offline', offline(userid, socket));
  // Set up the message handler
  socket.on('message', onMessage(io, userid));
  // Set up the seen handler
  socket.on('seen', onSeen(io, userid));
  // Set up the notification handler
}).on('disconnect', async function (socket) {
  var userid = socket.token.decoded.id;
  offline(userid, socket)();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', (req, res, next) => { req.io = io; next(); }, notifRouter);

http.listen(process.env.DOCKER_PORT || 8081, function () {
  console.log(`chat listening on *:${process.env.DOCKER_PORT || 8081}`);
});
