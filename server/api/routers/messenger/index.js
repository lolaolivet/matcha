const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});
router.use(bodyParser.json());

router.use('/conversation', require('./conversation'));
router.use('/message-seen', require('./message-seen'));
router.use('/last-messages', require('./last-messages'));

module.exports = router;
