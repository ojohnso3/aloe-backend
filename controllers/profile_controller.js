const db = require("../db.js");
const middleware = require("../middleware.js")

// - Get Profile
async function getProfile(username) {  
  const user = db.collection('users').doc(username.params.id)
  console.log('coconut', user)

  const profile = await user.get()
  console.log('orange', profile)

  if (profile.empty) {
    console.log('No matching document.');
    return;
  }
  console.log('peel', profile.data())

  return middleware.userMiddleware(profile.data());
}

// - Change profile (i.e. pic, bio, username, anonymity, consent) TBD: EMAIL??
// NOTE: need to change in every other location too
async function updateProfile(profileData) {
  const user = db.collection('users').doc(profileData.body.email);
  const res = await user.update(profileData.body);
  return res;
}

// - Load posts — /profile/posts
async function loadPosts(email) {
  const user = db.collection('users').doc(email)
  const posts = await user.collection('posts')
    .orderBy('timestamp')
    // .startAt(lastPost)
    .limit(10)
    .get();
  return posts;
}

// - Load saved — /profile/saved
async function loadSaved(email) {
  const user = db.collection('users').doc(email)
  const saved = await user.collection('saved')
    .orderBy('timestamp')
    // .startAt(lastPost)
    .limit(10)
    .get();
  return saved;
}



module.exports = {
  getProfile,
  updateProfile,
  loadPosts,
  loadSaved
}
