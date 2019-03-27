const { query } = require('./db');
const { getUserClients } = require('./users');

const express = require('express');
const router = express.Router();

const saveNotif = async (data) => {
  // If can, insert into db
  if (!(['block', 'unblock'].includes(data.type))) {
    await query(
      `INSERT INTO notifications (notif, receiver, sender, created)
      VALUES ($1, $2, $3, $4);`,
      [data.type, data.receiver, data.sender, data.created]
    );
  }
  return (data);
};

const checkIfBlocked = async (to, from) => {
  // Check if sender was blocked by receiver
  const senderIsBlocked = (await query(
    `SELECT *
    FROM block_log
    WHERE (
      (blocked_id=$1 AND user_id=$2)
      OR
      (blocked_id=$2 AND user_id=$1)
    )
    AND
    unblocked IS NULL
    AND
    latest`,
    [from, to])).rows[0];

  return (senderIsBlocked);
};

const broadcast = async (io, from, to, type) => {
  // Check notif name correct
  if (!(['match', 'like', 'view', 'unlike', 'block', 'unblock'].includes(type))) {
    throw new Error('Incorrect notification type');
  }

  // All the receiver's clients
  const receiverClients = getUserClients(to);

  // Create notif object
  const data = {
    receiver: to,
    type,
    sender: from,
    created: Date.now()
  };

  // Save
  const senderIsBlocked = await checkIfBlocked(to, from);
  const canSave = !senderIsBlocked;
  if (canSave) await saveNotif(data);

  // If type blocked or unblocked, client needs to be notified so that
  // app can refresh users on UI
  const canEmit = !senderIsBlocked || type === 'block' || type === 'unblock';
  // It the receiver has any client and if allowed, broadcast
  if (receiverClients && canEmit) {
    receiverClients.map((socketId) => {
      io.to(socketId).emit('notification', data);
    });
  }
};

const auth = (req, res, next) => {
  var token = req.headers.authorization;
  if (token !== process.env.MATCHA_SECRET) {
    return res.status(403).end();
  }
  next();
};

const handleNotif = (type) => async (req, res) => {
  await broadcast(req.io, parseInt(req.query.sender), parseInt(req.query.receiver), type);
  res.status(204).end();
};

router.get('/match', auth, handleNotif('match'));
router.get('/block', auth, handleNotif('block'));
router.get('/unblock', auth, handleNotif('unblock'));
router.get('/like', auth, handleNotif('like'));
router.get('/unlike', auth, handleNotif('unlike'));
router.get('/view', auth, handleNotif('view'));

module.exports = {
  router,
  saveNotif
};
