const express = require('express');
const userExists = require('../common/user-exists');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});

const {
  // Translate paw to client keys
  placeToClientKeys,
  attitudeToClientKeys,
  weaponToClientKeys,
  // Translate paw arrays to client keys
  placesArrayToClientKeys,
  attitudesArrayToClientKeys,
  weaponsArrayToClientKeys,
  // Check that paw exists
  checkPlaceId,
  checkAttitudeId,
  checkWeaponId,
  // Log paw
  logPlace,
  logAttitude,
  logWeapon,
  // Select last paw
  selectLastPlace,
  selectLastAttitude,
  selectLastWeapon
} = require('../common/paw-functions');

// router function
const db = require('../common/db');

const choosePAW = (checkid, log) => async (req, res) => {
  try {
    var id = req.body.id;
    // Check that the id exists and is well formed
    if (id && !isNaN(id)) {
      var uid = req.user.id;

      // Check that place exists
      if (await checkid(id)) {
        // Log the choice
        await log(uid, id);
        return (res.status(204).end());
      }

      // Default response
      return res.status(404).send({
        message: 'Could Not Find Element',
        code: 404
      });
    }

    // Default response
    return res.status(400).send({
      message: 'Bad Request',
      code: 400
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: 'Internal Server Error'
    });
  }
};

const choosePlace = choosePAW(checkPlaceId, logPlace);
const chooseAttitude = choosePAW(checkAttitudeId, logAttitude);
const chooseWeapon = choosePAW(checkWeaponId, logWeapon);

// Router

router.get('/available', async (req, res) => {
  try {
    var places = placesArrayToClientKeys((await db.query('SELECT * FROM places')).rows);
    var attitudes = attitudesArrayToClientKeys((await db.query('SELECT * FROM attitudes')).rows);
    var weapons = weaponsArrayToClientKeys((await db.query('SELECT * FROM weapons')).rows);
    var questions = (await db.query('SELECT * FROM tag_questions')).rows[0];

    var resObj = {
      place: {
        question: questions['places_question'],
        choices: places
      },
      attitude: {
        question: questions['attitudes_question'],
        choices: attitudes
      },
      weapon: {
        question: questions['weapons_question'],
        choices: weapons
      }
    };

    return (res.status(200).send(resObj));
  } catch (error) {
    res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    });
  }
});

router.post('/choose-p', choosePlace);
router.post('/choose-a', chooseAttitude);
router.post('/choose-w', chooseWeapon);

router.get('/', async (req, res) => {
  try {
    var uid;
    if (req.query.uid && await userExists.id(req.query.uid)) {
      uid = req.query.uid;
    } else {
      uid = req.user.id;
    }

    var place = placeToClientKeys(await selectLastPlace(uid));
    var attitude = attitudeToClientKeys(await selectLastAttitude(uid));
    var weapon = weaponToClientKeys(await selectLastWeapon(uid));

    return res.status(200).send({
      place,
      attitude,
      weapon
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: 'Internal Server Error'
    });
  }
});

module.exports = router;
