const db = require("../db.js");
const middleware = require("../middleware.js")
const helpers = require("../helpers.js")

// Load all posts of chosen status
async function getPostsByStatus(request) {
  const posts = db.collection('posts');
  const status = request.query.status;

  const selected = status === 'ALL' ?
    await posts.orderBy('timestamp').get() :
    await posts.where('status', '==', status).orderBy('timestamp').limit(10).get();
  if (selected.empty) {
    console.log('No matching documents.');
    return [];
  }

  const finalPosts = [];
  await Promise.all(selected.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(doc.data().userID);
    finalPosts.push(middleware.adminMiddleware(doc.id, doc.data(), userInfo))
  }));

  return finalPosts;
}

async function updatePostStatus(postID, newStatus, reason, timestamp) {
  const post = db.collection('posts').doc(postID);
  const res = await post.update({status: newStatus, statusNotes: reason, updatedTimestamp: timestamp});
  return res;
}

// Change status of post 
async function moderatePost(postData) {
  const postID = postData.body.postID;
  const newStatus = postData.body.status;
  const timestamp = postData.body.timestamp;
  const reason = postData.body.reason;

  return updatePostStatus(postID, newStatus, reason, timestamp)
}

// Report post
async function reportPost(reportData) {
  return updatePostStatus(reportData.postID, 'REJECTED', 'REPORT: ' + reportData.reason, reportData.timestamp)
}

// Report comment
async function reportComment(reportData) {

  const comment = db.collection('comments').doc(reportData.body.commentID);
  const res = await comment.update({removed: true});

  return res;
}

// Report User
async function reportUser(reportData) {
  const userID = reportData.body.userID;
  const reason = reportData.body.reason;
  const duration = reportData.body.duration;
  const timestamp = reportData.body.timestamp;

  const user = db.collection('users').doc(userID);
  const res = await user.update({ banned: { duration: duration, timestamp: timestamp, reason: reason } }); 
  console.log('reason: ', reason) // how to self-check??
  return res;
}

// Unban a user
async function unbanUser(userData) {
  const user = db.collection('users').doc(userData.body.userID);
  const userDoc = await user.get();
  const banned = userDoc.data().banned;

  const res = await user.update({ banned: { duration: 0, reason: 'Unbanned. Previous ban was on ' + banned.timestamp + ' for ' + banned.duration + ' days because' + banned.reason } }); 
  return res;
}

async function createAnswers(promptID, answersData) {
  await Promise.all(answersData.map(async (answer) => {
    answer.promptID = promptID;
    await db.collection('answers').add(answer);
  }));
  return 'works';
}

// Create new post
async function createPrompt(promptData) {
  const processedPrompt = processing.promptProcessing(promptData.body) // might have to be query
  if(!processedPrompt.prompt) {
    return 'There was an error in prompt creation';
  }

  const newPrompt = await db.collection('prompts').add(processedPrompt.prompt);
  const doc = await newPrompt.get();

  if(doc.data().numAnswers > 0) {
    if(!processedPrompt.answers) {
      return 'There was an error in prompt answer creation';
    }
    createAnswers(doc.id, processedPrompt.answers)
  }

  const userInfo = await helpers.getUserInfo(doc.data().userID);

  return {results: middleware.promptMiddleware(doc.id, doc.data(), userInfo)}
}

// // Load reported posts
// async function getReportedByType(reportType) {
//   const type = reportType.params.id; // POST, COMMENT, USER
//   console.log('type', type);

//   switch(type) {
//     case 'POST':
//       const posts = db.collection('posts');
//       const reportedPosts = await posts.where('reported', '==', true).get();
//       if (reportedPosts.empty) {
//         console.log('No matching documents.');
//         return;
//       }
//       var reported = []
//       // array of {post data + array of reports on post}
//       return reportedPosts.docs.map(async (doc) => {
//         const reportDocs = await db.collection('posts').doc(doc.id).collection('reports').get();
//         var allReports = []
//         reported.push(doc.data(), reportDocs.docs.map((doc) => allReports.push(doc.data())));
//       });
//     case 'COMMENT':
//       // complicated
//       break;
//     case 'USER':
//       const users = db.collection('users');
//       const reportedUsers = await users.where('reported', '==', true).get();
//       if (reportedUsers.empty) {
//         console.log('No matching documents.');
//         return;
//       }
//       var reported = []
//       // array of {user data + array of reports on user}
//       return reportedUsers.docs.map(async (doc) => {
//         const reportDocs = await db.collection('users').doc(doc.id).collection('reports').get();
//         var allReports = []
//         reported.push(doc.data(), reportDocs.docs.map((doc) => allReports.push(doc.data())));
//       });
//     default:
//       // error -- return failure if error
//       console.log('ERROR: Reporting type ' + type + ' is invalid.')
//       break;
//   }
//   return; // what??
// }

// // Get all reports for a specific post/comment/user
// async function getReportsByID() {
//   // TBD
// }
//
// // Get all banned users
// async function getBannedUsers() {
//   const users = db.collection('users');
//   const bannedUsers = await users.where('banned', '!=', null).get();
  
//   const banned = [];
//   await Promise.all(selected.docs.map(async (doc) => {
//     const userInfo = await helpers.getUserInfo(doc.data().userID);
//     banned.push(middleware.userMiddleware(doc.id, doc.data(), userInfo))
//   }));

//   // TODO: make below into helper function
  
//   return bannedUsers.docs.map(async (doc) => {
//     const reportDocs = await db.collection('users').doc(doc.id).collection('reports').get();
//     var allReports = []
//     banned.push(doc.data(), reportDocs.docs.map((doc) => allReports.push(doc.data())));
//   });
// }




module.exports = {
  getPostsByStatus,
  moderatePost,
  reportPost,
  reportComment,
  reportUser,
  unbanUser,
  createPrompt
  // getReportedByType,
  // getReportsByID,
  // getBannedUsers,
}








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
