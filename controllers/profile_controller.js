const db = require("../db.js");
const middleware = require("../middleware.js");
const helpers = require("../helpers.js");
const processing = require("../processing.js")


// Get Profile
async function getProfile(userData) {  
  console.log('id', userData.params.id)
  const users = db.collection('users');
  // const profile = await users.where('username', '==', userData.params.id).get();
  const profile = await users.doc(userData.params.id).get();
  if (!profile.exists) {
    console.log('No such user.');
    return;
  }
  // if(profile.docs.length != 1 ) {
  //   console.log('ERROR: More than one user with the same username.')
  // }
  // const userDoc = profile.docs[0];
  // return middleware.userMiddleware(userDoc.id, userDoc.data());
  return middleware.profileMiddleware(profile.id, profile.data());
}

// Load created posts on profile
async function getCreated(userData) {
  const userID = userData.query.id;
  const timestamp = userData.query.timestamp;
  const posts = db.collection('posts');
  var created = []; 
  if(timestamp) {
    created = await posts.where('userID', '==', userID).startAfter(timestamp).limit(5).get(); // .orderBy('timestamp', 'desc')
  } else {
    created = await posts.where('userID', '==', userID).limit(5).get();
  }
  if (created.empty) {
    console.log('No matching CREATED docs.');
    return;
  }

  const createdPosts = [];
  await Promise.all(created.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(userID);
    createdPosts.push(middleware.postMiddleware(doc.id, doc.data(), userInfo))
  }));

  return {results: createdPosts};
  // return helpers.getCreated(userData.body.id, userData.body.timestamp);

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
  console.log("query", userData.query)
  const userID = userData.query.id;
  const timestamp = userData.query.timestamp;
  const user = db.collection('users').doc(userID);
  var liked = [];
  if(timestamp) {
    liked = await user.collection('liked').orderBy('timestamp', 'desc').startAfter(timestamp).limit(5).get();
  } else {
    liked = await user.collection('liked').orderBy('timestamp', 'desc').limit(5).get();
  }

  if (liked.empty) {
    console.log('No matching document.');
    return {results: []};
  }

  const likedPosts = [];
  await Promise.all(liked.docs.map(async (doc) => {
    const likedData = await likedHelper(doc)
    const likedPost = likedData.post;
    const likedUser = likedData.user;

    const userInfo = await helpers.getUserInfo(likedUser.id);

    likedPosts.push(middleware.postMiddleware(likedPost.id, likedPost.data(), userInfo))
  }));

  return {results: likedPosts};
}


// Change profile
async function editProfile(profileData) {
  console.log("before processing lol")
  const processedProfile = processing.profileProcessing(profileData.body)
  console.log('proc', processedProfile)
  console.log('id', profileData.body.id)
  const user = db.collection('users').doc(profileData.body.id);
  // username, email, consent, profilePic, bio, anonymity
  const res = await user.update(processedProfile);
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