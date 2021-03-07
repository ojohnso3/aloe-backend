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

async function likedHelper(doc, type) {
  const posts = db.collection(type);
  const parentID = doc.data().parentID; // parentID vs postID
  const likedContent = await posts.doc(parentID).get();
  if (!likedContent.exists) {
    console.log('No document with id: ' + parentID);
    return null;
  }
  if(type == 'posts') {
    if (likedContent.data().status !== constants.APPROVED) {
      // console.log('Post is not approved: ' + postID);
      return null;
    }
  }

  return likedContent;
}

// Load liked posts/prompts on profile
async function getLiked(userData) {

  const userID = userData.query.id;
  const timestamp = userData.query.timestamp;
  const type = userData.query.type;

  console.log('id', id);
  console.log('timestamp', timestamp);
  console.log('type', type);

  const subcollection = type === 'prompts' ? 'prompted' : 'liked';
  console.log('sub', subcollection);


  const user = db.collection('users').doc(userID);
  let liked = [];
  if (timestamp) {
    const processedTimestamp = helpers.dateToTimestamp(timestamp);
    if (processedTimestamp) {
      liked = await user.collection(subcollection).orderBy('contentTimestamp', 'desc').startAfter(processedTimestamp).limit(5).get();
    }
  } else {
    console.log('before liked');
    liked = await user.collection(subcollection).orderBy('contentTimestamp', 'desc').limit(5).get();
  }

  console.log('after liked');

  if (liked.empty) {
    console.log('No matching document.');
    return {results: []};
  }

  const allLiked = [];
  await Promise.all(liked.docs.map(async (doc) => {
    console.log('before liked helper');
    const likedContent = await likedHelper(doc, type);
    console.log('after liked helper');
    if (likedContent) {
      const userInfo = await helpers.getUserInfo(likedContent.data().userID, likedContent.data().anonymous);
      if (type === 'posts') {
        allLiked.push(middleware.postMiddleware(likedContent.id, likedContent.data(), userInfo));
      } else if (type === 'prompts') {
        allLiked.push(middleware.promptMiddleware(likedContent.id, likedContent.data(), userInfo));
      }
    }
  }));

  return {results: allLiked};
}

// Update profile
async function editProfile(profileData) {
  const processedProfile = processing.profileProcessing(profileData.body);
  console.log('prof', processedProfile);
  if (!processedProfile || Object.keys(processedProfile).length === 0) {
    return false;
  }

  console.log('id', profileData.body.id);
  console.log('doin it body', processedProfile);

  const user = db.collection('users').doc(profileData.body.id);
  await user.update(processedProfile);
  return true;
}

module.exports = {
  getProfile,
  getCreated,
  getLiked,
  editProfile,
};
