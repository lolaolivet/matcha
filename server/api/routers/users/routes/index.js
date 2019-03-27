const express = require('express');
const config = require('../../../common/config.js');

// Router
const router = express.Router({
  mergeParams: true // inherit params from earlier router
});

// JSON middleware
const bodyParser = require('body-parser');
router.use(bodyParser.json({ limit: config['maxPayloadSize'] }));
router.use(bodyParser.urlencoded({ limit: config['maxPayloadSize'], extended: true }));

// images
// router.delete('/img', userExists.mid, require('./images'));
router.use('/img', require('./images'));
// profile-summary and profile
router.get('/profile-summary', require('./profile').summary);
router.get('/profile', require('./profile').get);
router.put('/profile', require('./profile').put);
// likes
// router.get('/likes', require('./likes'));

module.exports = router;
