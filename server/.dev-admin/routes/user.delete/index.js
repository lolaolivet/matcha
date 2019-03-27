const deleteUser= require('../../common/delete-user');

module.exports =
  async (req, res) => {
    var userids = req.body.ids;
    if (userids === undefined || !(userids instanceof Array)) {
      return (res.status(400).end());
    }

    try {
      for (let i in userids) {
        var userid = userids[i];
        await deleteUser(userid);
      }
      console.log((userids.length > 1 ? `${userids.length} users were deleted` : '1 user was deleted') + ' (/user.delete)');
    } catch (err) {
      return (res.status(500).send('Server Error'));
    }
    return (res.status(204).send());
  };
