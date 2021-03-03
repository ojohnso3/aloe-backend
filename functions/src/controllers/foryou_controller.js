const db = require('../firebase/db.js');
const middleware = require('../middleware.js');
const helpers = require('../helpers.js');
const constants = require('../constants.js');


// Get ForYou posts
async function getPosts(post) {
  const posts = db.collection('posts');
  let forYou = [];
  const timestamp = post.query.timestamp;
  if (timestamp) {
    const processedTimestamp = helpers.dateToTimestamp(timestamp);
    if (processedTimestamp) {
      forYou = await posts.where('status', '==', constants.APPROVED).orderBy('updatedAt', 'desc').startAfter(processedTimestamp).limit(5).get();
    }
  } else {
    forYou = await posts.where('status', '==', constants.APPROVED).orderBy('updatedAt', 'desc').limit(5).get();
  }
  if (forYou.empty) {
    console.log('Nothing for getPosts.');
    return {results: []};
  }

  const finalPosts = [];
  await Promise.all(forYou.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(doc.data().userID, doc.data().anonymous);
    finalPosts.push(middleware.postMiddleware(doc.id, doc.data(), userInfo));
  }));

  return {results: finalPosts};
}

// Get posts by topic
async function getPostsByTopic(post) {
  const topic = post.query.topic;
  const timestamp = post.query.timestamp;

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
    finalPosts.push(middleware.postMiddleware(doc.id, doc.data(), userInfo));
  }));

  return {results: finalPosts};
}

// Get top response on a prompt
async function getTopResponse(promptID) {
  const responses = db.collection('responses');
  const top = await responses.where('parentID', '==', promptID).orderBy('numLikes', 'desc').limit(1).get();

  if (top.empty) {
    console.log('No matching documents.');
    return '';
  }

  const topResponse = top.docs[0];
  return topResponse.data().body;
}

// Get prompts for feed
async function getPrompts(promptData) {
  const collection = db.collection('prompts');
  let prompts = [];
  const timestamp = promptData.query.timestamp;
  if (timestamp) {
    const processedTimestamp = helpers.dateToTimestamp(timestamp);
    if (processedTimestamp) {
      prompts = await collection.orderBy('updatedAt', 'desc').startAfter(processedTimestamp).limit(5).get();
    }
  } else {
    prompts = await collection.orderBy('updatedAt', 'desc').limit(5).get();
  }

  if (prompts.empty) {
    console.log('Nothing for getPrompts.');
    return {results: []};
  }

  const finalPrompts = [];
  await Promise.all(prompts.docs.map(async (doc) => {
    const topResponse = await getTopResponse(doc.id);
    const userInfo = await helpers.getUserInfo(constants.ALOE_ID, false); // SET FALSE
    finalPrompts.push(middleware.promptMiddleware(doc.id, doc.data(), userInfo, topResponse));
  }));

  return {results: finalPrompts};
}

// Get Responses by ID
async function getResponses(parentData) {
  const collection = db.collection('responses');

  const responses = await collection.where('parentID', '==', parentData.query.id).where('replyID', '==', '').orderBy('createdAt', 'desc').get();
  if (responses.empty) {
    console.log('No matching document for response.');
    return {results: []};
  }

  const finalResponses = [];
  await Promise.all(responses.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(doc.data().userID, doc.data().anonymous);
    finalResponses.push(middleware.responseMiddleware(doc.id, doc.data(), userInfo));
  }));

  return {results: finalResponses};
}

// Get Replies by ID
async function getReplies(parentData) { // ADDED 4 REPLIES
  const collection = db.collection('responses');
  const responses = await collection.where('replyID', '==', parentData.query.id).orderBy('createdAt', 'asc').get();
  if (responses.empty) {
    console.log('No matching document for response.');
    return {results: []};
  }

  const finalResponses = [];
  await Promise.all(responses.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(doc.data().userID, doc.data().anonymous);
    finalResponses.push(middleware.responseMiddleware(doc.id, doc.data(), userInfo));
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
