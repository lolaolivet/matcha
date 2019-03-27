const express = require('express');
const router = express.Router({
  mergeParams: true // inherit params from earlier router
});
const userExists = require('../../common/user-exists');

router.use('/:userid/', userExists.mid, require('./routes'));

module.exports = router;
