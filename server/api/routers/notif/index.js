const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});
router.use(bodyParser.json());

router.use('/all-seen', require('./all-seen'));

module.exports = router;
