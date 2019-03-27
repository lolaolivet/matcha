const db = require('./db');

const pawToClientKeys = (pawPre) => (paw) => {
  let clientPaw = {};
  clientPaw['id'] = paw[`${pawPre}_id`];
  clientPaw['name'] = paw[`${pawPre}_light`];
  clientPaw['darkName'] = paw[`${pawPre}_dark`];
  return (clientPaw);
};

const pawArrayToClientKeys = (pawPre) => (pawList) => pawList.map(pawToClientKeys(pawPre));

const checkPawId = (pawPre) => async (pawId) => {
  var result =
    await db.query(`
      SELECT EXISTS(SELECT 1 FROM ${pawPre}s WHERE ${pawPre}_id=$1)
    `, [pawId]);
  var {
    exists
  } = result.rows[0];
  return (exists);
};

const logPAW = (pawPre) => async (userid, pawId) => {
  // refresh logs
  await db.query(`
    UPDATE ${pawPre}_log
    SET latest = 'f'
    WHERE user_id = $1;`,
  [userid]);

  var result = await db.query(`
    INSERT INTO ${pawPre}_log
    (user_id, ${pawPre}_id, created, latest)
    VALUES ($1, $2, $3, TRUE)
  `, [userid, pawId, Date.now()]);

  // If no insert, throw
  if (!result.rowCount) {
    throw (new Error('Nothing happend'));
  }
};

const selectLastPAW = (pawPre) =>
  async (userid) =>
    (
      await db.query(`
        SELECT ${pawPre}s.*, log.created
        FROM ${pawPre}s
        INNER JOIN ${pawPre}_log AS log
        ON log.${pawPre}_id = ${pawPre}s.${pawPre}_id
        WHERE log.user_id = $1 AND latest;
      `,
      [userid])
    ).rows[0] || {};

module.exports = {
  // Translate paw to client keys
  placeToClientKeys: pawToClientKeys('place'),
  attitudeToClientKeys: pawToClientKeys('attitude'),
  weaponToClientKeys: pawToClientKeys('weapon'),
  // Translate paw arrays to client keys
  placesArrayToClientKeys: pawArrayToClientKeys('place'),
  attitudesArrayToClientKeys: pawArrayToClientKeys('attitude'),
  weaponsArrayToClientKeys: pawArrayToClientKeys('weapon'),
  // Check that paw exists
  checkPlaceId: checkPawId('place'),
  checkAttitudeId: checkPawId('attitude'),
  checkWeaponId: checkPawId('weapon'),
  // Log paw
  logPlace: logPAW('place'),
  logAttitude: logPAW('attitude'),
  logWeapon: logPAW('weapon'),
  // Select last paw
  selectLastPlace: selectLastPAW('place'),
  selectLastAttitude: selectLastPAW('attitude'),
  selectLastWeapon: selectLastPAW('weapon')
};
