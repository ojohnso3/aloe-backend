const db = require("../db.js");

// - Change profile — /profile/update (i.e. pic, bio, username, anonymity, consent) TBD: EMAIL??
async function updateProfile(email, profileData) {
  const user = db.collection('users').doc(email);
  const res = await user.update(profileData);
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
