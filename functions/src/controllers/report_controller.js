const db = require('../firebase/db.js');
const middleware = require('../middleware.js');
const constants = require('../constants.js');
const helpers = require('../helpers.js');
const sendgridController = require('./sendgrid_controller.js');

// Report post/response/user
async function reportFromApp(reportData) {
  const type = reportData.body.type; // posts, responses, users
  const reportingUser = reportData.body.userid;
  const reason = reportData.body.reason;
  const parentID = reportData.body.id;

  if (!parentID || !type) {
    console.log('ERROR: Need reported id + type');
    return false;
  }

  const newReport = {
    parentID: parentID,
    type: type,
    userID: reportingUser || 'No user.',
    reason: reason || 'No given reason.',
    status: constants.PENDING,
    createdAt: helpers.Timestamp.now(),
  };

  const parent = db.collection(type).doc(parentID);
  if (!(await parent.get()).exists) {
    console.log('No matching ' + type + ' document.');
    return false;
  }
  await parent.update({reported: true});
  db.collection('reports').add(newReport);

  // TODO: comment out when testing locally
  sendgridController.sendReportEmail(type, parentID);
  return true;
}

// Get all reports for a specific post/response/user
async function getReports() {
  const reports = await db.collection('reports').orderBy('createdAt', 'desc').get();
  if (reports.empty) {
    console.log('No matching report documents.');
    return [];
  }

  const reportDocs = [];
  await Promise.all(reports.docs.map(async (doc) => {
    reportDocs.push(middleware.reportMiddleware(doc.id, doc.data()));
  }));
  return reportDocs;
}

// BELOW FUNCTIONS ARENT IN USE YET

// Report post
async function reportPost(reportData) {
  return updatePostStatus(reportData.postID, 'REJECTED', 'REPORT: ' + reportData.reason, reportData.timestamp);
}

// Report response
async function reportResponse(reportData) {
  const response = db.collection('responses').doc(reportData.body.responseID);
  await response.update({removed: true});

  return true;
}

// Report User
async function reportUser(reportData) {
  const userID = reportData.body.userID;
  const reason = reportData.body.reason;
  const duration = reportData.body.duration;
  const timestamp = reportData.body.timestamp;

  const user = db.collection('users').doc(userID);
  await user.update({banned: {duration: duration, timestamp: timestamp, reason: reason}});
  return true;
}

// Unban a user
async function unbanUser(userData) {
  const user = db.collection('users').doc(userData.body.userID);
  const userDoc = await user.get();
  const banned = userDoc.data().banned;

  await user.update({banned: {duration: 0, reason: 'Unbanned. Previous ban was on ' + banned.timestamp + ' for ' + banned.duration + ' days because' + banned.reason}});
  return true;
}

// Load reported posts
async function getReportedByType(reportType) {
  const type = reportType.params.id; // POST, RESPONSE, USER

  switch (type) {
    case 'POST':
      const posts = db.collection('posts');
      const reportedPosts = await posts.where('reported', '==', true).get();
      if (reportedPosts.empty) {
        console.log('No matching documents.');
        return;
      }
      const reported = [];
      // array of {post data + array of reports on post}
      return reportedPosts.docs.map(async (doc) => {
        const reportDocs = await db.collection('posts').doc(doc.id).collection('reports').get();
        const allReports = [];
        reported.push(doc.data(), reportDocs.docs.map((doc) => allReports.push(doc.data())));
      });
    case 'RESPONSE':
      // complicated
      break;
    case 'USER':
      const users = db.collection('users');
      const reportedUsers = await users.where('reported', '==', true).get();
      if (reportedUsers.empty) {
        console.log('No matching documents.');
        return;
      }
      reported = [];
      // array of {user data + array of reports on user}
      return reportedUsers.docs.map(async (doc) => {
        const reportDocs = await db.collection('users').doc(doc.id).collection('reports').get();
        const allReports = [];
        reported.push(doc.data(), reportDocs.docs.map((doc) => allReports.push(doc.data())));
      });
    default:
      // error -- return failure if error
      console.log('ERROR: Reporting type ' + type + ' is invalid.');
      break;
  }
  return; // what??
}

// Get all reports for a specific post/response/user
async function getReportsByID() {
  // TBD
}

// Get all banned users
async function getBannedUsers() {
  const users = db.collection('users');
  const bannedUsers = await users.where('banned', '!=', null).get();

  const banned = [];
  await Promise.all(selected.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(doc.data().userID, false); // TBD on anon
    banned.push(middleware.userMiddleware(doc.id, doc.data(), userInfo));
  }));

  // Make below into helper function

  return bannedUsers.docs.map(async (doc) => {
    const reportDocs = await db.collection('users').doc(doc.id).collection('reports').get();
    const allReports = [];
    banned.push(doc.data(), reportDocs.docs.map((doc) => allReports.push(doc.data())));
  });
}

// Reactivate user
async function reactivateUser(data) {
  // const users = db.collection('users').where('email', '==', emailData.body.email);
  // const userDoc = await users.get();
  // if (userDoc.empty || userDoc.docs.length > 1) {
  //   console.log('No such user or toom many.');
  //   return null;
  // }

  // const userData = userDoc.docs[0];

  // if (!userData.data().removed) {
  //   console.log('User is currently active!');
  //   return false;
  // }

  // const user = db.collection('users').doc(userData.id);

  // await user.update({removed: false});
  // return true;
}


module.exports = {
  reportFromApp,
  getReportedByType,
  getReports,
  getReportsByID,
  getBannedUsers,
  reportPost,
  reportResponse,
  reportUser,
  unbanUser,
  reactivateUser,
};
