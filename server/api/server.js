const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const proxy = require('express-http-proxy');
const config = require('./common/config.js');
const { updateAllScores } = require('./common/compute_score');
const cron = require('node-cron');

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json({
  limit: config['maxPayloadSize']
}));
app.use(bodyParser.urlencoded({
  limit: config['maxPayloadSize'],
  extended: true
}));

// Static
app.use('/assets', express.static('./assets'));

// API
app.use('/api/', require('./routers/entry-point'));

// Client
const passport = require('passport');
const { jwtCookieStrategy } = require('./routers/_utils/jwt');
passport.use('jwt-cookie', jwtCookieStrategy);

// Serve the client...
app.use('/',
  (req, res, next) => {
    // Filter for paths that are either /app/... or /app
    // (but importantly not /app...)
    if (req.path.match(/^\/app\/.*|^\/app$/)) {
      // Check that there is a valid jwt in the cookies
      passport.authenticate('jwt-cookie', {
        session: false,
        failureRedirect: '/login'
      })(req, res, next);
    } else {
      next();
    }
  },
  // Proxy to the client
  proxy('http://client:3000/')
);

// schedule the calcul of people scores every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('recalculating scores...');
  await updateAllScores();
  console.log('scores updated');
});

// Start server

app.listen(process.env.MAIN_PORT, () => {
  console.log('api listening on port ' + process.env.MAIN_PORT);
});
