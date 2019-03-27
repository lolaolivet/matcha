const db = require('../..//db');

module.exports =
  async (_, res) => {
    try {
      await db.query(`UPDATE like_log SET created = created - 1220000000`);
      await db.query(`UPDATE display_log SET created = created - 1220000000`);
    } catch (err) {
      return (res.status(500).send('Server Error'));
    }
    return (res.status(204).send());
  };
