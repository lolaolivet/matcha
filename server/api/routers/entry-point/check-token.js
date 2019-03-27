const router = require('express').Router();
const useridTo = require('../../common/userid-to');
const { selectProfile } = require('../users/routes/profile');

router.get('/', async (req, res) => {
  let profile = await useridTo.privateProfile(req.user.id);
  let profileSum = await useridTo.profileSummary(req.user.id);
  let fullProfile = await selectProfile(req.user.id, null);
  profile = {
    ...profile,
    ...profileSum,
    ...fullProfile,
  };
  res.status(200).send({
    profile
  });
});

module.exports = router;
