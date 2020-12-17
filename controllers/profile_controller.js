const db = require("../db.js");
const middleware = require("../middleware.js");
const helpers = require("../helpers.js");

// Get Profile
async function getProfile(userData) {  
  console.log('id', userData.params.id)
  console.log('username', userData.params.username)
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
  console.log('body', userData.body)
  console.log('query', userData.query)
  const userID = userData.body.id;
  const timestamp = userData.body.timestamp;
  const posts = db.collection('posts');
  var created = []; 
  console.log('before created fnc')
  if(timestamp) {
    created = await posts.where('userID', '==', userID).startAfter(timestamp).limit(5).get(); // .orderBy('timestamp', 'desc')
  } else {
    console.log('made it to created fnc', userID)
    created = await posts.where('userID', '==', userID).limit(5).get();
    console.log('after1', created.size)
  }
  console.log('after2', created.size)
  if (created.empty) {
    console.log('No matching CREATED docs.');
    return;
  }

  console.log('after3', created.size)

  const createdPosts = [];
  await Promise.all(created.docs.map(async (doc) => {
    console.log('inside promise', doc.data())
    const userInfo = await helpers.getUserInfo(userID);
    createdPosts.push(middleware.postMiddleware(doc.id, doc.data(), userInfo))
  }));

  console.log('final arra', createdPosts)

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
  const user = db.collection('users').doc(userData.query.id)
  var liked = []
  if(userData.query.timestamp) {
    liked = await user.collection('liked').orderBy('timestamp', 'desc').startAfter(userData.query.timestamp).limit(5).get();
  } else {
    liked = await user.collection('liked').orderBy('timestamp', 'desc').limit(5).get();
  }

  if (liked.empty) {
    console.log('No matching document.');
    return {results: []};
  }

  const likedPosts = [];
  await Promise.all(liked.docs.map(async (doc) => {
    // if(!doc.data().removed) {
    const likedData = await likedHelper(doc)
    const likedPost = likedData.post;
    const likedUser = likedData.user;

    const userInfo = await helpers.getUserInfo(likedUser.id);

    likedPosts.push(middleware.postMiddleware(likedPost.id, likedPost.data(), userInfo))
    // }
  }));

  return {results: likedPosts};
}


// - Change profile (i.e. pic, bio, username, anonymity, consent) TBD: EMAIL??
async function editProfile(profileData) {
  const user = db.collection('users').doc(profileData.body.id);
  // email, username, consent, profilePic, bio
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