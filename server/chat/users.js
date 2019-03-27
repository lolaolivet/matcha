const fetch = require('node-fetch');
const { query } = require('./db');
const connectedUsers = new Map();
const connectedClients = new Map();

/**
 * Shape of the user map
 *  {
 *    <userid>: [<sockerIds...>],
 *    <userid>: [<sockerIds...>],
 *    <userid>: [<sockerIds...>],
 *  }
 *
 * Shape of the client map
 *  {
 *    <socketid>: { socketid, timestamp, userid },
 *    <socketid>: { socketid, timestamp, userid },
 *    <socketid>: { socketid, timestamp, userid },
 *  }
 */

const getUserClients = (userid) => {
  return connectedUsers.get(userid);
};

const useridConnected = (userid) => {
  const userClients = connectedUsers.get(userid);
  return (userClients && userClients.length !== 0);
};

const saveClient = (userid, socketid) => {
  // If connected
  if (connectedUsers.has(userid)) {
    // Get the user's clients
    let userClients = connectedUsers.get(userid);
    // If current client not part of the user's clients
    // And user has less than 10 clients
    const tooMany = userClients.length >= 10;
    if (!userClients.includes(socketid) && !tooMany) {
      // Add the current client to the user's clients
      userClients.push(socketid);
      /* DO NOT REMOVE */ // console.log(`user ${userid} has a new client : ${socketid}`);
      // printClients(userid);
    } else if (tooMany) {
      return (false);
    }
  } else { // If not connected
    // Create the user entry and fill it with the current client
    connectedUsers.set(userid, [socketid]);
    /* DO NOT REMOVE */ // console.log(`user ${userid} was added`);
    // printClients(userid);
  }
  // Update the client
  connectedClients.set(socketid, { socketid, timestamp: Date.now(), userid });
  return (true);
};

/*
   lundi                              jeudi 14h                       jeudi 18h
sc -_-_-_-_-_-_-_-_-_-_          ...  -_-_-_-_-_  ...  -_-_-_-_-_

rc ------______------______----  ...  --______--  ...  ----______------______------______

on ------------------------      ...  ----------  ...  ----------------
of                         ----  ...              ...                  ------------------

ev |on                     |off  ...  |on         ...                  |off

ls *                                  *
lo                         *                                           *

last seen : 12 dev 2345
lastseen > lastout ? online : offline

*mac ----------------
*iph ---------
*and ----------------------
user
 len 3........2.......1....0->deleteuser
*/

const removeClient = (userid, socketid) => {
  const userClients = connectedUsers.get(userid);
  // If user has clients and it includes the current client
  if (userClients && userClients.includes(socketid)) {
    // Remove the current client
    userClients.splice(userClients.indexOf(socketid), 1);
  }
  // If user has no client
  if (!userClients) {
    // Remove the user
    connectedUsers.delete(userid);
  }
  // Remove the client
  connectedClients.delete(socketid);
  /* DO NOT REMOVE */ // console.log(`user ${userid}'s client ${socketid} was removed`);
  // printClients(userid);

  // log the last time user was disconnected
  try {
    query('UPDATE user_info SET last_out = $1 WHERE user_id = $2;', [Date.now(), userid]);
  } catch (error) {
    console.error(error);
  }
};

const cleanClients = () => {
  const date = Date.now();
  const toDelete = [];
  // Perform inventory of the clients that need to be deleted
  connectedClients.forEach((value) => {
    // If client did not send online request in the last 10 seconds before clean
    if (value.timestamp < (date - 10000)) {
      // Add to the clients that should be deleted
      toDelete.push(value);
    }
  });

  // Perform the deletes
  toDelete.map(value => {
    const { socketid, userid } = value;
    /* DO NOT REMOVE */ // console.log(`client ${socketid} (user ${userid}) is innactive...`);
    removeClient(userid, socketid);
  });
};

// Schedule cleanClients every 30 seconds
setInterval(cleanClients, 30000);

const getListOfConnectedContacts = async (userid) => {
  const res = await fetch(`http://matcher:9004/matches?uid=${userid}`, {
    method: 'GET',
    headers: {
      'x-user-id': 'admin'
    }
  });

  // Parse the body
  const body = await res.json();

  // If not 200
  if (!res.status || res.status !== 200) {
    // Throw
    throw new Error(`call to http://matcher:9004/matches?uid=${userid} yielded ${res.status}`);
  }

  // Extract the ids
  const matchIds = body.map(user => user.userid);
  // Filter off offline users
  const connected = matchIds.filter(useridConnected);

  // Return online matches ids

  return (connected);
};

module.exports = { saveClient, removeClient, getUserClients, getListOfConnectedContacts };
