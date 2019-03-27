const express = require('express');
const db = require('../common/db');
const format = require('pg-format');

const router = express.Router({
  mergeParams: true // inherit params from earlier router
});

const selectPreferences = (userid) => {
  let request;

  request = format(`SELECT * FROM user_preferences WHERE user_id = %L;`, userid);
  return db.query(request);
};

const update = (table, key, value, userid) => {
  let stmt;
  let request;

  stmt = `UPDATE ${table} SET ${key} = %L WHERE user_id = %L`;
  request = format(stmt, value, userid);
  return db.query(request);
};

function createChangeLog (done = true, issue) {
  var ret = {
    'date': new Date().getTime(),
    done,
    issue
  };
  return (ret);
};

const updateAllKeysInTable = async function (keyTable, table, body, userid) {
  const changes = {};
  for (let i = 0; i < keyTable.length; i++) {
    let key = keyTable[i];
    let value = body[key];
    // If value exists in body
    if (value !== undefined) {
      try {
        await update(table, key, (value.trim && value.trim()) || value, userid);
        // Mutate changes
        changes[key] = createChangeLog();
      } catch (err) {
        throw new Error({ error: 'Server Error', code: 500 });
      }
    }
  }
  return (changes);
};

router.get('/', async (req, res) => {
  if (parseInt(req.query.uid) !== parseInt(req.user.id)) {
    return (res.status(403).end());
  }
  try {
    const result = await selectPreferences(req.query.uid);
    return (
      res.status(200).send(result.rows[0])
    );
  } catch (err) {
    return (
      res.status(500).send({
        message: 'Internal Server Error',
        code: 500
      })
    );
  }
});

router.put('/', async (req, res) => {
  if (parseInt(req.query.uid) !== parseInt(req.user.id)) {
    return (res.status(403).end());
  }
  const prefBefore = (await selectPreferences(req.query.uid)).rows[0];
  const body = req.body;
  // If values are not legal
  if (
    (body['looking_for_male'] !== undefined && typeof body['looking_for_male'] !== 'boolean') ||
    (body['looking_for_female'] !== undefined && typeof body['looking_for_female'] !== 'boolean') ||
    (body['looking_for_other'] !== undefined && typeof body['looking_for_other'] !== 'boolean') ||
    (body['age_max'] !== undefined && (typeof body['age_max'] !== 'number' || body['age_max'] > 80)) ||
    (body['age_min'] !== undefined && (typeof body['age_min'] !== 'number' || body['age_min'] < 18)) ||
    (body['age_min'] !== undefined && body['age_max'] !== undefined && body['age_min'] > body['age_max']) ||
    (body['score_max'] !== undefined && (typeof body['score_max'] !== 'number' || body['score_max'] > 100)) ||
    (body['score_min'] !== undefined && (typeof body['score_min'] !== 'number' || body['score_min'] < 0)) ||
    (body['score_min'] !== undefined && body['score_max'] !== undefined && body['score_min'] > body['score_max']) ||
    (body['distance_max'] !== undefined && (typeof body['distance_max'] !== 'number' || body['distance_max'] < 1 || body['distance_max'] > 50))
  ) {
    // 400
    return (
      res.status(400).send({
        message: 'Bad Request',
        code: 4001
      })
    );
  }

  const pref = {
    'looking_for_male':
      body['looking_for_male'] === undefined
        ? prefBefore['looking_for_male']
        : body['looking_for_male'],
    'looking_for_female':
      body['looking_for_female'] === undefined
        ? prefBefore['looking_for_female']
        : body['looking_for_female'],
    'looking_for_other':
      body['looking_for_other'] === undefined
        ? prefBefore['looking_for_other']
        : body['looking_for_other'],
    'age_max':
      body['age_max'] === undefined
        ? prefBefore['age_max']
        : body['age_max'],
    'age_min':
      body['age_min'] === undefined
        ? prefBefore['age_min']
        : body['age_min'],
    'score_max':
      body['score_max'] === undefined
        ? prefBefore['score_max']
        : body['score_max'],
    'score_min':
      body['score_min'] === undefined
        ? prefBefore['score_min']
        : body['score_min'],
    'distance_max':
      body['distance_max'] === undefined
        ? prefBefore['distance_max']
        : body['distance_max']
  };

  if (
    pref['looking_for_female'] === false &&
    pref['looking_for_male'] === false &&
    pref['looking_for_other'] === false
  ) {
    // 400
    return (
      res.status(400).send({
        message: 'Can\'t look for no-one',
        code: 4002
      })
    );
  }

  try {
    const changes = await updateAllKeysInTable(
      // keys
      [
        'looking_for_male',
        'looking_for_female',
        'looking_for_other',
        'age_min',
        'age_max',
        'score_min',
        'score_max',
        'distance_max'
      ],
      // table
      'user_preferences',
      pref,
      req.query.uid
    );

    return (
      res.status(201).send({ preferences: pref, Modified: changes })
    );
  } catch (err) {
    console.error(err);
    return (
      res.status(500).send('Server Error')
    );
  }
});

module.exports = router;
