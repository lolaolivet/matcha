const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});
router.use(bodyParser.json());

router.use('/preferences', require('./preferences'));
router.use('/matches', require('./matches'));
router.use('/suggestions', require('./suggestions'));
router.use('/like', require('./like'));
router.use('/likes', require('./likes'));
router.use('/unlike', require('./unlike'));
router.use('/paw', require('./paw'));
router.use('/display', require('./display'));
router.use('/displays', require('./displays'));

router.use('/block', require('./block'));
router.use('/blocks', require('./blocks'));
router.use('/unblock', require('./unblock'));

router.use('/report', require('./report'));

router.use('/score', require('./score'));
router.use('/last-log', require('./last-log'));

module.exports = router;
