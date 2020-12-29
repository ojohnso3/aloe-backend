const db = require('./firebase/db.js');
const middleware = require('./middleware.js');

async function getCreated(userID, timestamp) {
  const posts = db.collection('posts');
  let created = [];
  if (timestamp) {
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
    createdPosts.push(middleware.postMiddleware(doc.id, doc.data(), userInfo));
  }));

  return {results: createdPosts};
}

async function getUserInfo(userID) {
  const userDoc = await db.collection('users').doc(userID).get();
  let userInfo = {};
  if (!userDoc.exists) {
    console.log('No matching user document.'); // return an error here
    const anonID = 'xOi20I8ehuqyhKdwt6wh'; // current user for Anonymous
    const anonDoc = await db.collection('users').doc(anonID).get();
    if (!anonDoc.exists) {
      console.log('ERROR: no Anonymous account');
    } else {
      // make sure it exists
      userInfo = {
        userID: anonID,
        username: anonDoc.data().username,
        profilePic: anonDoc.data().profilePic,
        verified: anonDoc.data().verified,
      };
    }
  } else {
    userInfo = {
      userID: userID,
      username: userDoc.data().username,
      profilePic: userDoc.data().profilePic,
      verified: userDoc.data().verified,
    };
  }
  return userInfo;
}

module.exports = {
  getCreated,
  getUserInfo,
};
