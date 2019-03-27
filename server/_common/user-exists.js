const db = require('./db');

const userExists = (key) => async (value) => {
  try {
    const userid = (await db.query(`
      SELECT user_id FROM user_auth WHERE ${key} = $1`,
    [value])).rows[0]['user_id'];
    return (userid);
  } catch (error) {
    return false;
  }
};

const id = userExists('user_id');
const email = userExists('user_email');
const login = async (login) => {
  try {
    const userid = (await db.query(`
      SELECT user_id FROM user_auth WHERE LOWER(user_login) = LOWER($1)`,
    [login])).rows[0]['user_id'];
    return (userid);
  } catch (error) {
    return false;
  }
};
// Express middleware function that uses the promise
const mid = (req, res, next) => {
  let value = req.params.userid;

  return (
    id(value)
      .then((res) => {
        if (res) return next();
        else return (Promise.reject(new Error(404)));
      })
      .catch((err) => {
        if (err.message === '404') {
          res.status(404).send({
            message: 'User not found'
          });
        } else if (err.message === '400') {
          res.status(400).send({
            message: 'Bad Request'
          });
        } else {
          res.status(500).end();
        }
      })
  );
};

module.exports = { mid, fn: id, id, email, login };
