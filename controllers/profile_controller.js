const db = require("../db.js");
const middleware = require("../middleware.js");
const helpers = require("../helpers.js");

// Get Profile
async function getProfile(username) {  
  const users = db.collection('users');
  const profile = await users.where('username', '==', username.params.id).get();
  if (profile.empty) {
    console.log('No such user.');
    return;
  }
  if(profile.docs.length != 1 ) {
    console.log('ERROR: More than one user with the same username.')
  }
  const userDoc = profile.docs[0];
  return middleware.profileMiddleware(userDoc.id, userDoc.data());
}

// Load created posts on profile
async function getCreated(userData) {
  return {results: helpers.getCreated(userData.body.userID)};

  // Before helper
  // const posts = db.collection('posts');
  // const created = await posts.where('userID', '==', userData.body.userID).get(); // .where('removed', '==', false)
  // if (created.empty) {
  //   console.log('No matching document.');
  //   return;
  // }
  // return {results: created.docs.map((doc) => middleware.postMiddleware(doc.id, doc.data()))};
}

async function likedHelper(doc) {
  const posts = db.collection('posts');
    const postID = doc.data().postID;
    const likedPost = await posts.doc(postID).get();
    if (!likedPost.exists) {
      console.log('No document with postid: ' + postID);
      return;
    }
    const likedUser = await db.collection('users').doc(likedPost.data().userID).get();
    return {post: likedPost, user: likedUser}
}

// Load liked posts on profile
async function getLiked(userData) {
  const user = db.collection('users').doc(userData.body.userID)
  const liked = await user.collection('liked').orderBy('timestamp').limit(5).get();
  if (liked.empty) {
    console.log('No matching document.');
    return;
  }

  const likedPosts = [];
  await Promise.all(liked.docs.map(async (doc) => {
    if(!doc.data().removed) {
      const likedData = await likedHelper(doc)
      const likedPost = likedData.post;
      const likedUser = likedData.user;

      likedPosts.push(middleware.postMiddleware(likedPost.id, likedPost.data(), likedUser.data().username))
    }
  }));

  return {results: likedPosts};
}


// - Change profile (i.e. pic, bio, username, anonymity, consent) TBD: EMAIL??
async function editProfile(profileData) {
  const user = db.collection('users').doc(profileData.body.userID);
  // probably have processing here to match with database fields
  const res = await user.update(profileData.body.updates);
  return res; // TODO: return value
}



module.exports = {
  getProfile,
  getCreated,
  getLiked,
  editProfile
}


  // const likedPosts = await Promise.all(liked.docs.map(async (doc) => {
  //   const postID = doc.data().postID;
  //   const likedPost = await posts.doc(postID).get();
  //   if (!likedPost.exists) {
  //     console.log('No document with postid: ' + postID);
  //     return;
  //   }
  //   const likedUser = await db.collection('users').doc(likedPost.data().userID).get();
  //   middleware.postMiddleware(likedPost.id, likedPost.data(), likedUser.data().username)
  // }))
  // returns null ??