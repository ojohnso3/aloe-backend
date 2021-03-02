const db = require('../firebase/db.js');
const middleware = require('../middleware.js');
const helpers = require('../helpers.js');
const processing = require('../processing.js');
const constants = require('../constants.js');

// Get external profile
async function getProfile(userData) {
  const profile = await db.collection('users').doc(userData.params.id).get();
  if (!profile.exists) {
    console.log('No such user profile.');
    return;
  }

  return middleware.profileMiddleware(profile.id, profile.data());
}

// Load anonymous created posts on profile
async function getAnonymousCreated(timestamp) {
  const posts = db.collection('posts');

  let created = [];
  if (timestamp) {
    const processedTimestamp = helpers.dateToTimestamp(timestamp);

    if (processedTimestamp) {
      created = await posts.where('status', '==', constants.APPROVED).where('anonymous', '==', true).orderBy('updatedAt', 'desc').startAfter(processedTimestamp).limit(5).get();
    }
  } else {
    created = await posts.where('status', '==', constants.APPROVED).where('anonymous', '==', true).orderBy('updatedAt', 'desc').limit(5).get();
  }

  if (created.empty) {
    console.log('No matching CREATED ANON docs.');
    return {results: []};
  }

  const createdPosts = [];
  await Promise.all(created.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(constants.ANONYMOUS_ID, true); // SET TO TRUE
    createdPosts.push(middleware.postMiddleware(doc.id, doc.data(), userInfo));
  }));

  console.log('ANON created size: ', createdPosts.length);

  return {results: createdPosts};
}

// Load created posts on profile
async function getCreated(userData) {
  const userID = userData.query.id;
  const timestamp = userData.query.timestamp;
  const internal = userData.query.internal;

  if (userID === constants.ANONYMOUS_ID) {
    return getAnonymousCreated(timestamp);
  }

  const posts = db.collection('posts');

  let created = [];
  if (internal === '1') {
    if (timestamp) {
      const processedTimestamp = helpers.dateToTimestamp(timestamp);
      if (processedTimestamp) {
        created = await posts.where('userID', '==', userID).orderBy('updatedAt', 'desc').startAfter(processedTimestamp).limit(5).get();
      }
    } else {
      created = await posts.where('userID', '==', userID).orderBy('updatedAt', 'desc').limit(5).get();
    }
  } else {
    if (timestamp) {
      const processedTimestamp = helpers.dateToTimestamp(timestamp);
      if (processedTimestamp) {
        created = await posts.where('userID', '==', userID).where('status', '==', constants.APPROVED).where('anonymous', '==', false).orderBy('updatedAt', 'desc').startAfter(processedTimestamp).limit(5).get();
      }
    } else {
      created = await posts.where('userID', '==', userID).where('status', '==', constants.APPROVED).where('anonymous', '==', false).orderBy('updatedAt', 'desc').limit(5).get();
    }
  }

  if (created.empty) {
    console.log('No matching CREATED docs.');
    return {results: []};
  }

  const createdPosts = [];
  await Promise.all(created.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(userID, doc.data().anonymous); // WAS set to false
    createdPosts.push(middleware.postMiddleware(doc.id, doc.data(), userInfo));
  }));

  return {results: createdPosts};
}

async function likedHelper(doc) {
  const posts = db.collection('posts');
  const postID = doc.data().parentID; // parentID vs postID
  const likedPost = await posts.doc(postID).get();
  if (!likedPost.exists) {
    console.log('No document with postid: ' + postID);
    return null;
  }
  if (likedPost.data().status !== constants.APPROVED) {
    console.log('Post is not approved: ' + postID);
    return null;
  }

  return likedPost;
}

// Load liked posts on profile (TODO FIX FOR PROMPTS TOO)
async function getLiked(userData) {
  const userID = userData.query.id;
  const timestamp = userData.query.timestamp;

  const user = db.collection('users').doc(userID);
  let liked = [];
  if (timestamp) {
    const processedTimestamp = helpers.dateToTimestamp(timestamp);
    if (processedTimestamp) {
      liked = await user.collection('liked').orderBy('contentTimestamp', 'desc').startAfter(processedTimestamp).limit(5).get();
    }
  } else {
    liked = await user.collection('liked').orderBy('contentTimestamp', 'desc').limit(5).get();
  }

  if (liked.empty) {
    console.log('No matching document.');
    return {results: []};
  }

  const likedPosts = [];
  await Promise.all(liked.docs.map(async (doc) => {
    const likedPost = await likedHelper(doc);
    if (likedPost) {
      const userInfo = await helpers.getUserInfo(likedPost.data().userID, likedPost.data().anonymous);
      likedPosts.push(middleware.postMiddleware(likedPost.id, likedPost.data(), userInfo));
    }
  }));

  return {results: likedPosts};
}

// Update profile
async function editProfile(profileData) {
  const processedProfile = processing.profileProcessing(profileData.body);

  console.log('id', profileData.body.id)
  const user = db.collection('users').doc(profileData.body.id);
  await user.update(processedProfile);
  console.log('finished well yas king')
  return true;
}

module.exports = {
  getProfile,
  getCreated,
  getLiked,
  editProfile,
};
