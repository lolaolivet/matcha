const format = require('pg-format');
const db = require('./db');
const fs = require('fs');
const path = require('path');

const deleteUser = async (userid) => {
  // const selectLogoutSession = (sessionId) => {
  //   let request;
  //   request = format(`
  //     SELECT logout_log.session_id
  //     FROM login_log JOIN logout_log
  //     ON login_log.session_id = logout_log.session_id
  //     WHERE login_log.user_id = %L`, sessionId);
  //   return (db.query(request));
  // };

  // Function that deletes in a given table on a given condition (key=value)
  const deleteFromTableOnCondition = (table) => (key, value) => {
    let request = format(`DELETE FROM ${table} WHERE ${key} = %L`, value);
    return (db.query(request));
  };

  // Function that gets a user's images
  const getUserImages = async (userid) => {
    let request = format('SELECT * FROM images WHERE owner_id = %L;', userid);
    let result = await db.query(request);
    return result.rows;
  };

  // Function to delete each file (if exist) from disk
  const unlinkFiles = (files) => {
    files.map(file => (fs.existsSync(file.path) && fs.unlinkSync(file.path)));
  };

  // Delete user images
  var images = (await getUserImages(userid));
  unlinkFiles(images.map(im => ({
    path: path.join(im['image_path'], im['image_name'])
  })));

  // Delete user data
  // (delete all user traces in all tables)
  // ! The order in which table contents are deleted is important.
  await deleteFromTableOnCondition('images')('owner_id', userid);
  await deleteFromTableOnCondition('user_info')('user_id', userid);
  await deleteFromTableOnCondition('location_log')('user_id', userid);
  await deleteFromTableOnCondition('place_log')('user_id', userid);
  await deleteFromTableOnCondition('attitude_log')('user_id', userid);
  await deleteFromTableOnCondition('weapon_log')('user_id', userid);
  await deleteFromTableOnCondition('user_preferences')('user_id', userid);
  await deleteFromTableOnCondition('display_log')('viewed_id', userid);
  await deleteFromTableOnCondition('display_log')('user_id', userid);
  await deleteFromTableOnCondition('block_log')('user_id', userid);
  await deleteFromTableOnCondition('block_log')('blocked_id', userid);
  await deleteFromTableOnCondition('report_log')('user_id', userid);
  await deleteFromTableOnCondition('report_log')('reported_id', userid);
  await deleteFromTableOnCondition('like_log')('sender_id', userid);
  await deleteFromTableOnCondition('like_log')('receiver_id', userid);
  await deleteFromTableOnCondition('match_log')('user_1', userid);
  await deleteFromTableOnCondition('match_log')('user_2', userid);
  await deleteFromTableOnCondition('messages')('msg_from', userid);
  await deleteFromTableOnCondition('messages')('msg_to', userid);
  await deleteFromTableOnCondition('logout_log')('user_id', userid);
  await deleteFromTableOnCondition('notifications')('receiver', userid);
  await deleteFromTableOnCondition('notifications')('sender', userid);
  await deleteFromTableOnCondition('login_log')('user_id', userid);
  await deleteFromTableOnCondition('user_auth')('user_id', userid); // delete user_auth last
};

module.exports = deleteUser;