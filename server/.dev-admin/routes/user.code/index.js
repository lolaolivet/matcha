const db = require('../..//db');

const selectUserConfirmCodes = async (id) => {
  const ret = await db.query(`
    select token_mail
    from user_auth
    where user_id = $1
  `, [id]);
  if (!ret.rowCount) {
    throw (new Error('Server Error'));
  }
  return (JSON.parse(ret.rows[0]['token_mail']));
};

const selectUserPwdCodes = async (id) => {
  const ret = await db.query(`
    select token_pwd
    from user_auth
    where user_id = $1
  `, [id]);
  if (!ret.rowCount) {
    throw (new Error('Server Error'));
  }
  return (JSON.parse(ret.rows[0]['token_pwd']));
};

module.exports =
  async (req, res) => {
    var userid = req.query.uid;
    if (userid === undefined) {
      return (res.status(400).end());
    }

    try {
      var token;
      if (req.query.token === 'pwd') {
        token = await selectUserPwdCodes(userid);
      } else {
        token = await selectUserConfirmCodes(userid);
      }
      return (res.status(200).send(token));
    } catch (err) {
      console.error(err);
      return (res.status(500).send('Server Error'));
    }
  };
