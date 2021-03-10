const db = require('../firebase/db.js');
const middleware = require('../middleware.js');
const helpers = require('../helpers.js');
const constants = require('../constants.js');


// Get ForYou posts
async function getPosts(postData) {
  console.log('entering get posts', postData.query);
  const posts = db.collection('posts');
  let forYou = [];

  // const userID = post.query.userid;
  const timestamp = postData.query.timestamp;

  if (timestamp) {
    const processedTimestamp = helpers.dateToTimestamp(timestamp);
    if (processedTimestamp) {
      forYou = await posts.where('status', '==', constants.APPROVED).orderBy('updatedAt', 'desc').startAfter(processedTimestamp).limit(5).get();
    }
  } else {
    console.log('getposts no timestamp');
    forYou = await posts.where('status', '==', constants.APPROVED).orderBy('updatedAt', 'desc').limit(5).get();
  }

  if (forYou.empty) {
    console.log('Nothing for getPosts.');
    return {results: []};
  }

  console.log('entering getposts processing!');

  const finalPosts = [];
  await Promise.all(forYou.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(doc.data().userID, doc.data().anonymous);
    // const liked = await helpers.checkLiked(doc.id, userID, 'posts');
    finalPosts.push(middleware.postMiddleware(doc.id, doc.data(), userInfo)); // removed liked
  }));

  console.log('finishing getposts w results');

  return {results: finalPosts};
}

// Get posts by topic
async function getPostsByTopic(postData) {
  const topic = postData.query.topic;
  const timestamp = postData.query.timestamp;

  // const userID = post.query.userid;
  const posts = db.collection('posts');
  let forYou = [];
  if (timestamp) {
    const processedTimestamp = helpers.dateToTimestamp(timestamp);
    if (processedTimestamp) {
      forYou = await posts.where('content.topics', 'array-contains', topic).where('status', '==', constants.APPROVED).orderBy('updatedAt', 'desc').startAfter(processedTimestamp).limit(5).get();
    }
  } else {
    forYou = await posts.where('content.topics', 'array-contains', topic).where('status', '==', constants.APPROVED).orderBy('updatedAt', 'desc').limit(5).get();
  }
  if (forYou.empty) {
    console.log('No matching documents.');
    return {results: []};
  }

  const finalPosts = [];
  await Promise.all(forYou.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(doc.data().userID, doc.data().anonymous);
    // const liked = await helpers.checkLiked(doc.id, userID, 'posts');
    finalPosts.push(middleware.postMiddleware(doc.id, doc.data(), userInfo)); // removed liked
  }));

  return {results: finalPosts};
}

// Get top response on a prompt
// async function getTopResponse(promptID) {
//   const responses = db.collection('responses');
//   const top = await responses.where('parentID', '==', promptID).orderBy('numLikes', 'desc').limit(1).get();

//   if (top.empty) {
//     console.log('No matching documents.');
//     return '';
//   }

//   const topResponse = top.docs[0];
//   return topResponse.data().body;
// }

// Get prompts for feed
async function getPrompts(promptData) {
  console.log('entering get prompts', promptData.query);
  const collection = db.collection('prompts');
  let prompts = [];

  // const userID = promptData.query.userid;
  const timestamp = promptData.query.timestamp;
  if (timestamp) {
    const processedTimestamp = helpers.dateToTimestamp(timestamp);
    if (processedTimestamp) {
      prompts = await collection.orderBy('updatedAt', 'desc').startAfter(processedTimestamp).limit(5).get();
    }
  } else {
    console.log('getprompts no timestamp');
    prompts = await collection.orderBy('updatedAt', 'desc').limit(5).get();
  }

  if (prompts.empty) {
    console.log('Nothing for getPrompts.');
    return {results: []};
  }

  console.log('entering getprompts processing!');

  const finalPrompts = [];
  await Promise.all(prompts.docs.map(async (doc) => {
    // const topResponse = await getTopResponse(doc.id);
    const userInfo = await helpers.getUserInfo(constants.ALOE_ID, false); // SET FALSE
    // const liked = await helpers.checkLiked(doc.id, userID, 'prompts');
    finalPrompts.push(middleware.promptMiddleware(doc.id, doc.data(), userInfo)); // removed liked
  }));

  console.log('finishing getprompts w results');

  return {results: finalPrompts};
}

// Get Responses by ID
async function getResponses(parentData) {
  const collection = db.collection('responses');

  // const userID = parentData.query.userid;

  const responses = await collection.where('parentID', '==', parentData.query.id).where('replyID', '==', '').orderBy('createdAt', 'desc').get();
  if (responses.empty) {
    console.log('No matching document for response.');
    return {results: []};
  }

  const finalResponses = [];
  await Promise.all(responses.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(doc.data().userID, doc.data().anonymous);
    // const liked = await helpers.checkLiked(doc.id, userID, 'responses');
    finalResponses.push(middleware.responseMiddleware(doc.id, doc.data(), userInfo)); // removed liked
  }));

  return {results: finalResponses};
}

// Get Replies by ID
async function getReplies(parentData) {
  const collection = db.collection('responses');
  // const userID = parentData.query.userid;

  const responses = await collection.where('replyID', '==', parentData.query.id).orderBy('createdAt', 'asc').get();
  if (responses.empty) {
    console.log('No matching document for response.');
    return {results: []};
  }

  const finalResponses = [];
  await Promise.all(responses.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(doc.data().userID, doc.data().anonymous);
    // const liked = await helpers.checkLiked(doc.id, userID, 'responses');
    finalResponses.push(middleware.responseMiddleware(doc.id, doc.data(), userInfo)); // removed liked
  }));

  return {results: finalResponses};
}


module.exports = {
  getPosts,
  getPostsByTopic,
  getPrompts,
  getResponses,
  getReplies,
};
