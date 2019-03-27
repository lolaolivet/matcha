const db = require('../..//db');
const deleteUser= require('../../common/delete-user');

module.exports =
  async (req, res) => {
    try {
      var userids = (await db.query(
        `SELECT user_id AS userid FROM user_auth`
      )).rows.map(u => u.userid);
      for (let i in userids) {
        var userid = userids[i];
        await deleteUser(userid);
      }
      console.log(`All users were deleted (${userids.length})` + ' (/user.flush)');
      await db.query(
        `ALTER SEQUENCE user_auth_user_id_seq RESTART WITH 1`
      );
      console.log(`Restarted sequence "user_id"` + ' (/user.flush)');
    } catch (err) {
      return (res.status(500).send('Server Error'));
    }
    return (res.status(204).send());
  };
