const db = require("./db.js");

async function getUserInfo(userID) {
  const userDoc = await db.collection('users').doc(userID).get();
  var userInfo = {};
  if (!userDoc.exists) {
    console.log('No matching user document.'); // return an error here
  } else {
    userInfo = {
      username: userDoc.data().username,
      profilePic: userDoc.data().profilePic,
      verified: userDoc.data().verified,
    }
  }
  return userInfo;
}

module.exports = {
  getUserInfo
}