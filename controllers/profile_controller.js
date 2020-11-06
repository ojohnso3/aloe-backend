const db = require("../db.js");

// - Change profile (i.e. pic, bio, username, anonymity, consent) TBD: EMAIL??
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
  updateProfile,
  loadPosts,
  loadSaved
}
