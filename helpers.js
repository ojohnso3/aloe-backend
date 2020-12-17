const db = require("./db.js");
const middleware = require("./middleware.js")

async function getCreated(userID, timestamp) {
  const posts = db.collection('posts');
  var created = []; 
  if(timestamp) {
    created = await posts.where('userID', '==', userID).startAfter(timestamp).limit(5).get(); // .orderBy('timestamp', 'desc')
  } else {
    created = await posts.where('userID', '==', userID).limit(5).get();
  }
  if (created.empty) {
    console.log('No matching document.');
    return;
  }

  const createdPosts = [];
  await Promise.all(created.docs.map(async (doc) => {
    const userInfo = await getUserInfo(userID);
    createdPosts.push(middleware.postMiddleware(doc.id, doc.data(), userInfo))
  }));

  return {results: createdPosts};
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