const db = require('../firebase/db.js');
const middleware = require('../middleware.js');
const processing = require('../processing.js');
const helpers = require('../helpers.js');
const constants = require('../constants.js');


// Login as admin
async function adminLogin(adminData) {
  const email = adminData.params.id;
  const users = db.collection('users');
  const adminUser = await users.where('email', '==', email).where('removed', '==', false).get();

  if (adminUser.empty) {
    console.log('No such user.');
    return {};
  }
  if (adminUser.docs.length != 1 ) {
    console.log('ERROR: More than one user with the same email.');
    return {};
  }

  const userDoc = adminUser.docs[0];

  if(userDoc.data().type != 'ADMIN') {
    console.log('ERROR: User is not an Admin.');
    return {};
  }

  return middleware.userMiddleware(userDoc.id, userDoc.data());
}

// Load all posts of chosen status
async function getPostsByStatus(request) {
  const posts = db.collection('posts');
  const status = request.query.status || 'ALL'; // If the status is undefined, make it 'ALL'

  const selected = status === 'ALL' ?
    await posts.orderBy('timestamp').get() :
    await posts.where('status', '==', status).orderBy('timestamp').limit(10).get();
  if (selected.empty) {
    console.log('No matching documents.');
    return [];
  }

  const finalPosts = [];
  await Promise.all(selected.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(doc.data().userID, doc.data().anonymous);
    finalPosts.push(middleware.adminMiddleware(doc.id, doc.data(), userInfo));
  }));

  return finalPosts;
}

// Change status of post
async function moderatePost(postData) {
  const updates = postData.body; 
  const post = db.collection('posts').doc(updates.id);
  const res = await post.update({status: updates.status, adminNotes: updates.notes, updatedAt: updates.timestamp});
  return res;
}

// Create new prompt
async function createPrompt(promptData) {
  const processedPrompt = processing.promptProcessing(promptData.body);
  if (!processedPrompt.prompt) {
    return 'There was an error in prompt creation';
  }

  const newPrompt = await db.collection('prompts').add(processedPrompt.prompt);
  const doc = await newPrompt.get();

  // if (doc.data().numAnswers > 0) {
  //   if (!processedPrompt.answers) {
  //     return 'There was an error in prompt answer creation';
  //   }
  //   createAnswers(doc.id, processedPrompt.answers);
  // }

  if(doc.data().userID != constants.ALOE_ID) {
    console.log('ERROR: ids do not match');
  }
  const userInfo = await helpers.getUserInfo(constants.ALOE_ID, false);

  return {results: middleware.promptMiddleware(doc.id, doc.data(), userInfo, '')};
}

// Edit prompt
async function editPrompt(promptData) {
  // TBD
}

// Add topics to db
async function addTopic(topicData) {
  const processedTopic = processing.topicProcessing(topicData.body)

  if(!processedTopic) {
    return 'error1'; // if error
  }

  // Not necessary -- just a fail safe that I can activate if necessary
  const topicDoc = await db.collection('topics').where('topic', '==', processedTopic.topic).get();
  if (!topicDoc.empty) {
    console.log('Topic already in db');
    return 'error2';
  }

  await db.collection('topics').add(processedTopic);
  return '1'; // res?

}

// Remove topics to db
async function removeTopic(topicData) {
  const topic = topicData.body.topic;
  if(!topic) {
    return 'error1';
  }

  const topicDoc = await db.collection('topics').where('topic', '==', topic).get();
  if (topicDoc.empty) {
    return 'error2';
  }

  // Just in case there are duplicates
  await Promise.all(topicDoc.docs.map(async (doc) => {
    db.collection('topics').doc(doc.id).delete();
  }));

  return '1';
}

// Update topic in db
// NOTE: be careful because topics in posts will NOT be automatically updated
async function editTopic(topicData) {
  const original = topicData.body.original;
  const topicInfo = topicData.body.data;
  const processedTopic = processing.topicProcessing(topicInfo)

  console.log('new pr', processedTopic)

  if(!processedTopic.topic || !original) {
    return 'error1';
  }

  const topic = await db.collection('topics').where('topic', '==', original).get();

  if(topic.empty) { // check for duplicates
    console.log('Topic does not exist in the database.')
    return 'error2';
  }

  const topicDoc = topic.docs[0];
  const res = await topicDoc.ref.update(processedTopic); // res?
  return '1';
}

// Get all topics
async function getTopics() {
  const topics = await db.collection('topics').orderBy('topic', 'asc').get();
  if (topics.empty) {
    console.log('Topic get failed.');
    return {results: []};
  }

  var topicTags = [];
  await Promise.all(topics.docs.map(async (doc) => {
    const description = doc.data().description || 'Description here.';
    topicTags.push({topic: doc.data().topic, description: description});
  }));
  return {results: topicTags};
}

// Add email to db
async function addEmail(emailData) {
  const emailInfo = emailData.body;

  const emailDoc = await db.collection('emails').where('email', '==', emailInfo.email).get();
  if (emailDoc.empty) {
    console.log('Email not already in db');
    const email = await db.collection('emails').add(emailInfo);
    return email;
  } else {
    console.log('Email already in db');
    return 'Already exists';
  }
}

module.exports = {
  adminLogin,
  getPostsByStatus,
  moderatePost,
  createPrompt,
  editPrompt,
  getTopics,
  addTopic,
  editTopic,
  removeTopic,
  addEmail,
};


  // const postID = postData.body.postID;
  // const newStatus = postData.body.status;
  // const timestamp = postData.body.timestamp;
  // const reason = postData.body.reason;

  // // if (!postID || !newStatus || !timestamp || !reason) {
  // //   return {};
  // // }

  // return updatePostStatus(postID, newStatus, reason, timestamp);

// async function updatePostStatus(postData) {
//   const updates = postData.body; 
//   console.log('pd', updates)
//   const post = db.collection('posts').doc(postID);
//   const res = await post.update({status: updates.newStatus, updatedAt: updates.timestamp});
//   return res;
// }

// // - view a post — /post
// async function viewPost(postID) {
//   const post = db.collection('posts').doc(postID.params.id)
//   console.log("check sid", post)
//   return post;
// }

// async function addNewUser(userData) {
//   const res = await db.collection('users').get(userData.body.username);
//   return res;
// }

// async function loginUser(userData) {
//   const users = db.collection('users');
//   const user = await users.where('username', '==', userData.body.email).where('password', '==', userData.body.password).get();
//   if (user.empty) {
//     console.log('No matching documents.');
//     return;
//   }
//   return user;
// }

// async function addNewPost() {
//   const postData = {
//     postID: '002',
//     userID: '123456789',
//     email: 'sidneysux@aloe.co',
//     timestamp: 'October 10, 2020',
//     content: '<p>More content.</p>',
//     title: 'I want to post.',
//     image: 'aloe.jpg',
//     status: 'SUBMITTED',
//     type: 'Story',
//     likes: 'null',
//     featured: 'false'
//   }
//   const newPost = await db.collection('posts').add(postData);
//   console.log('p', newPost)
//   return newPost;
// }

// async function updateUser(userData) {
//   const userDoc = db.collection('users').doc(userData.body.userID);
//   const res = await userDoc.update(userData.body);
//   return res;
// }

// async function testingFunction() {
//   const snapshot = await db.collection('users').get();
//   snapshot.forEach((doc) => {
//     console.log(doc.id, '=>', doc.data());
//   });
//   return "Testing!";
// }

// async function createAnswers(promptID, answersData) {
//   await Promise.all(answersData.map(async (answer) => {
//     answer.promptID = promptID;
//     await db.collection('answers').add(answer);
//   }));
//   return 'works';
// }

// Change notes (HERE)
// async function updateNotes(postData) {
//   const updates = postData.body; 
//   const post = db.collection('posts').doc(updates.id);
//   const res = await post.update({adminNotes: updates.notes, updatedAt: updates.timestamp});
//   return res;
// }