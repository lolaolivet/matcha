const router = require('express').Router();
const db = require('./../..//db');
const format = require('pg-format');

const update = async (table, dbKey, newVal, userid) => {
  let stmt = `UPDATE ${table} SET ${dbKey} = %L WHERE user_id = %L;`;
  let request = format(stmt, newVal, userid);
  let result = await db.query(request);
  let updated = !!result.rowCount;

  return (updated);
};

router.post('/', async (req, res) => {
  // Body has id ?
  if (req.body.id === undefined) {
    //  No --> 400
    return (
      res.status(400).send({
        message: 'Missing required field: id',
        code: 400
      })
    );
  }

  let result;

  // Update user
  try {
    result = await update('user_auth', 'confirmed', true, req.body.id);
  } catch (error) {
    console.error(error);
    return (
      res.status(500).send({
        message: 'Server Error',
        code: 500
      })
    );
  }

  if (!result) {
    //  No update --> 404
    return (
      res.status(404).send({
        message: 'User Not Found',
        code: 404
      })
    );
  }

  // Respond --> 202
  return (
    res.status(202).end()
  );
});

module.exports = router;
