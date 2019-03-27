const db = require('../../common/db');
const userExists = require('../../common/user-exists');

const iplocation = require('iplocation').default;
const router = require('express').Router();

router.get('/', async (req, res, status) => {
  try {
    var clientIp = req.connection.remoteAddress;
    var location = await iplocation(clientIp);
    if (!location.latitude) {
      location = {
        city: 'Pointe du Trou au Vin',
        latitude: '49.863931',
        longitude: '0.643045',
      };
    }
    return (res.status(200).send(location));
  } catch (err) {
    console.error(err);
    return (res.status(500).send({
      code: 500,
      message: 'Internal Server Error'
    }));
  }
});

router.post('/', async (req, res, status) => {
  let date = Date.now();
  try {
    // Check if all informations are sent
    if (!req.body.userid ||
        !req.body.coordinates) {
      return (
        res.status(400).send({
          message: 'Error with the geolocation',
          code: 4001
        })
      );
    }
    // Check if user user exists
    var userIsValid = await userExists.id(req.body.userid);
    if (!userIsValid) {
      return res.status(404).send({
        message: 'User Not Found',
        code: 4041
      });
    }

    // default values for localhost = copacabana
    const coord = { ...req.body.coordinates };
    coord.latitude = coord.latitude === null ? '-22.9773065' : coord.latitude;
    coord.longitude = coord.longitude === null ? '-43.1898984' : coord.longitude;

    await db.query(
      `INSERT INTO location_log
        (user_id, coordinates, created)
        VALUES ($1, $2, $3)`,
      [req.body.userid, coord, date]
    );
    res.status(204).end();
  } catch (err) {
    return res.status(500).send({
      message: 'Internal Server Error',
      code: 500
    });
  }
});

module.exports = router;
