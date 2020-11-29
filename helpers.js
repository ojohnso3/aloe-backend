const db = require("./db.js");
const middleware = require("../middleware.js");

async function getCreated(userID) {
  const posts = db.collection('posts');
  const created = await posts.where('userID', '==', userID).get(); // .where('removed', '==', false)
  if (created.empty) {
    console.log('No matching document.');
    return;
  }
  return created.docs.map((doc) => middleware.postMiddleware(doc.id, doc.data()));
}

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
  getCreated,
  getUserInfo
}