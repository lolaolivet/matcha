const router = require('express').Router();
const {
  logPlace
} = require('../../common/paw-functions');

router.post('/', async (req, res) => {
  if (!(req.body.ids instanceof Array)) {
    return (res.status(400).end());
  }
  var userids = req.body.ids;
  var nbUser = userids.length;
  var place = req.query.placeid;
  try {
    if (place) {
      for (let i in userids) {
        console.log(Date.now());
        await logPlace(userids[i], place);
      }
    }
    var message = `${nbUser} users were logged${place ? ' in place nº' + place : ''}`;
    res.status(200).send({
      message,
      userids
    });
    console.log(message);
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

module.exports = router;
