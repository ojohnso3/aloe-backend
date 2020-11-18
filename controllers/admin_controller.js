const db = require("../db.js");
const middleware = require("../middleware.js")

// Load all posts of chosen status
async function getPostsByStatus(status) {
  const posts = db.collection('posts');
  console.log('stt', status.query.status);
  const selected = await posts.where('status', '==', status.query.status).orderBy('timestamp').limit(10).get();
  if (selected.empty) {
    console.log('No matching documents.');
    return [];
  }

  return selected.docs.map((doc) => middleware.postMiddleware(doc.id, doc.data()));
}

// - Load reported posts
async function getReportedByType(reportType) {
  const type = reportType.params.id; // POST, COMMENT, USER
  console.log('type', type);

  switch(type) {
    case 'POST':
      const posts = db.collection('posts');
      const reportedPosts = await posts.where('reported', '==', true).get();
      if (reportedPosts.empty) {
        console.log('No matching documents.');
        return;
      }
      var reported = []
      // array of {post data + array of reports on post}
      return reportedPosts.docs.map(async (doc) => {
        const reportDocs = await db.collection('posts').doc(doc.id).collection('reports').get();
        var allReports = []
        reported.push(doc.data(), reportDocs.docs.map((doc) => allReports.push(doc.data())));
      });
    case 'COMMENT':
      // complicated
      break;
    case 'USER':
      const users = db.collection('users');
      const reportedUsers = await users.where('reported', '==', true).get();
      if (reportedUsers.empty) {
        console.log('No matching documents.');
        return;
      }
      var reported = []
      // array of {user data + array of reports on user}
      return reportedUsers.docs.map(async (doc) => {
        const reportDocs = await db.collection('users').doc(doc.id).collection('reports').get();
        var allReports = []
        reported.push(doc.data(), reportDocs.docs.map((doc) => allReports.push(doc.data())));
      });
    default:
      // error -- return failure if error
      console.log('ERROR: Reporting type ' + type + ' is invalid.')
      break;
  }
  return; // what??
}

// Get all reports for a specific post/comment/user
async function getReportsByID() {
  // TBD
}

// Get all banned users
async function getBannedUsers() {
  const users = db.collection('users');
  const bannedUsers = await users.where('banned', '!=', null).get();
  var banned = [];
  // TODO: make below into helper function
  return bannedUsers.docs.map(async (doc) => {
    const reportDocs = await db.collection('users').doc(doc.id).collection('reports').get();
    var allReports = []
    banned.push(doc.data(), reportDocs.docs.map((doc) => allReports.push(doc.data())));
  });
}

// Change status of post 
async function moderatePost(postData) {
  const postID = postData.body.id;
  const newStatus = postData.body.status;
  const reason = postData.body.reason;

  const post = db.collection('posts').doc(postID)
  const res = await post.update({status: newStatus});
  // send reason
  console.log('reason: ', reason)
  return res;
}

// Report post
async function reportPost(postID, reason) {
  const updatePost = {
    id: postID,
    newStatus: 'REJECTED',
    reason: 'REPORT: ' + reason
  }
  updatePostStatus(updatePost)
  return res;
}

// Report comment
async function reportComment(userID, ban) {
  const user = db.collection('users').doc(userID)
  const res = await user.update({banned: ban});
  return res;
}

// Report User
async function reportUser(reportData) {
  const username = reportData.body.username;
  const reason = reportData.body.reason;
  const duration = reportData.body.duration;
  const timestamp = reportData.body.timestamp;

  const user = db.collection('users').doc(username)
  const res = await user.update({ banned: { duration, timestamp } }); // how to self-check??
  // send reason
  console.log('reason: ', reason)
  return res;
}

// Unban a user
async function unbanUser(username) {
  const user = await db.collection('users').doc(username).get();
  const res = await user.update({ banned: null });
  // save history somehow
  return res;
}




module.exports = {
  getPostsByStatus,
  getReportedByType,
  getReportsByID,
  getBannedUsers,
  moderatePost,
  reportPost,
  reportComment,
  reportUser,
  unbanUser,
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
