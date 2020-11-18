const db = require("../db.js");
const middleware = require("../middleware.js")

// - Get Profile
async function getProfile(username) {  
  const user = db.collection('users').doc(username.params.id)
  const profile = await user.get()
  if (profile.empty) {
    console.log('No matching document.');
    return;
  }
  return middleware.userMiddleware(profile.data());
}

// - Change profile (i.e. pic, bio, username, anonymity, consent) TBD: EMAIL??
// NOTE: need to change in every other location too
async function editProfile(profileData) {
  const user = db.collection('users').doc(profileData.body.email);
  const res = await user.update(profileData.body);
  return res;
}

// Load created posts on profile
async function getCreated(userID) {
  const user = db.collection('users').doc(userID)
  const created = await user.collection('created').orderBy('timestamp').get();
  if (created.empty) {
    console.log('No matching document.');
    return;
  }
  return {results: created.docs.map((doc) => middleware.postMiddleware(doc.id, doc.data()))};
}

// Load liked posts on profile
async function getLiked(userID) {
  const user = db.collection('users').doc(userID)
  const liked = await user.collection('created').orderBy('timestamp').get();
  if (liked.empty) {
    console.log('No matching document.');
    return;
  }
  return {results: liked.docs.map((doc) => middleware.postMiddleware(doc.id, doc.data()))};
}



module.exports = {
  getProfile,
  editProfile,
  getCreated,
  getLiked
}
