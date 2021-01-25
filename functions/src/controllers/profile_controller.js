const db = require('../firebase/db.js');
const middleware = require('../middleware.js');
const helpers = require('../helpers.js');
const processing = require('../processing.js');


// Get external profile
async function getProfile(userData) {
  const profile = await db.collection('users').doc(userData.params.id).get();
  if (!profile.exists) {
    console.log('No such user profile.');
    return;
  }

  return middleware.profileMiddleware(profile.id, profile.data());
}

// Load created posts on profile
async function getCreated(userData) {
  const userID = userData.body.id;
  const timestamp = userData.body.timestamp;
  const internal = userData.body.internal;

  const posts = db.collection('posts');
  
  let created = [];
  if(internal) {
    if (timestamp) {
      created = await posts.where('userID', '==', userID).orderBy('timestamp', 'desc').startAfter(timestamp).limit(5).get();
    } else {
      created = await posts.where('userID', '==', userID).orderBy('timestamp', 'desc').limit(5).get();
    }
  } else {
    if (timestamp) {
      created = await posts.where('userID', '==', userID).where('status', '==', 'APPROVED').where('anonymous', '==', false).orderBy('timestamp', 'desc').startAfter(timestamp).limit(5).get();
    } else {
      created = await posts.where('userID', '==', userID).where('status', '==', 'APPROVED').where('anonymous', '==', false).orderBy('timestamp', 'desc').limit(5).get();
    }
  }

  if (created.empty) {
    console.log('No matching CREATED docs.');
    return {results: []};
  }

  const createdPosts = [];
  await Promise.all(created.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(userID, false);
    createdPosts.push(middleware.postMiddleware(doc.id, doc.data(), userInfo));
  }));

  // console.log('created size: ', createdPosts.length)

  return {results: createdPosts};
}

async function likedHelper(doc) {
  const posts = db.collection('posts');
  const postID = doc.data().postID;
  const likedPost = await posts.doc(postID).get();
  if (!likedPost.exists) {
    console.log('No document with postid: ' + postID);
    return null;
  }
  if (likedPost.data().status != 'APPROVED') {
    console.log('Post is not approved: ' + postID);
    return null;
  }

  const likedUser = await db.collection('users').doc(likedPost.data().userID).get();
  return {post: likedPost, user: likedUser};
}

// Load liked posts on profile
async function getLiked(userData) {
  const userID = userData.query.id;
  const timestamp = userData.query.timestamp;
  const user = db.collection('users').doc(userID);
  let liked = [];
  if (timestamp) {
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
    const likedData = await likedHelper(doc);
    if(likedData) {
      const likedPost = likedData.post;
      const likedUser = likedData.user;
  
      const userInfo = await helpers.getUserInfo(likedUser.id, likedPost.data().anonymous);
  
      likedPosts.push(middleware.postMiddleware(likedPost.id, likedPost.data(), userInfo));
    }
  }));

  return {results: likedPosts};
}


// Change profile
async function editProfile(profileData) {
  // console.log("before processing lol")
  const processedProfile = processing.profileProcessing(profileData.body);
  console.log('proc', processedProfile);
  console.log('id', profileData.body.id);
  const user = db.collection('users').doc(profileData.body.id);
  // username, profilePic, bio, consent
  const res = await user.update(processedProfile);
  return res; // TODO: return value
}


module.exports = {
  getProfile,
  getCreated,
  getLiked,
  editProfile,
};


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

  // if(profile.docs.length != 1 ) {
  //   console.log('ERROR: More than one user with the same username.')
  // }
  // const userDoc = profile.docs[0];
  // return middleware.userMiddleware(userDoc.id, userDoc.data());

   // return helpers.getCreated(userData.body.id, userData.body.timestamp);


  // Before helper
  // const posts = db.collection('posts');
  // const created = await posts.where('userID', '==', userData.body.userID).get(); // .where('removed', '==', false)
  // if (created.empty) {
  //   console.log('No matching document.');
  //   return;
  // }
  // return {results: created.docs.map((doc) => middleware.postMiddleware(doc.id, doc.data()))};
