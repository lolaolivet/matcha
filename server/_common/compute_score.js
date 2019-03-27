const db = require('./db');

const score = async (userid) => {
    if (userid) {
      try {
        var unliked = (await db.query(
          `SELECT COUNT(*) as unlikes FROM like_log
            WHERE receiver_id = $1 AND unliked = true`, [userid])).rows[0];
        var liked = (await db.query(
          `SELECT COUNT(*) as likes FROM like_log
            WHERE receiver_id = $1`, [userid])).rows[0];
          // AND unliked IS NOT NULL
        var blocked = (await db.query(
          `SELECT COUNT(*) as blocks FROM block_log
            WHERE blocked_id = $1`, [userid])).rows[0];
          // AND unblocked IS NOT NULL
        var matched = (await db.query(
          `SELECT COUNT(*) as matches FROM match_log
          WHERE (user_1 = $1 OR user_2 = $1)`, [userid])).rows[0];
          // AND unmatched IS NOT NULL
        var viewed = (await db.query(
          `SELECT COUNT(*) as views FROM display_log
            WHERE viewed_id = $1 AND fullprofile = true`, [userid])).rows[0];

        var finalScore = parseInt(viewed.views * 10) +
                    parseInt(matched.matches * 100) +
                    parseInt(liked.likes * 50) -
                    parseInt(blocked.blocks * 100) -
                    parseInt(unliked.unlikes * 50);

        return finalScore;

        } catch (err) {
          console.error(err);
        }
    };
  };

  const updateAllScores = async () => {

    // get number of ids in db
    const users = (await db.query(
      `select user_id from user_auth`
    )).rows;

    // calcul and associate scores
    for(var i= 0; i < users.length; i++)
      users[i]['score'] = await score(users[i].user_id);

    // get highest score and lowest score
    const max = Math.max.apply(Math, users.map(function(e) { return e.score; }))
    const min = Math.min.apply(Math, users.map(function(e) { return e.score; }))
    const ecart = Math.abs(max - min);

    // loop and associate computed scores
    try {
      for(var i= 0; i < users.length; i++) {
        let computedScore = ((users[i].score - min) / ecart) * 100;
        // update users score in db
        await db.query('UPDATE user_info SET score = $1 WHERE user_id = $2', [computedScore, users[i].user_id]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  module.exports = { score, updateAllScores };