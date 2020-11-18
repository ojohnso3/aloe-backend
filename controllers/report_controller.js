const db = require("../db.js");
const middleware = require("../middleware.js")
const processing = require("../processing.js")

// Report post/comment/user
async function report(reportData) {
  const type = reportData.body.type; // POST, COMMENT, USER
  const timestamp = reportData.body.timestamp;
  const reportingUser = reportData.body.user1;
  const reason = reportData.body.reason;

  const postID = reportData.body.postID; // optional (only for post/comment)
  const commentID = reportData.body.commentID; // optional (only for comment)
  const reportedUser = reportData.body.user2; // optional (only for user)

  const newReport = {
    reportingUser: reportingUser,
    reason: reason,
    status: 'PENDING',
    timestamp: timestamp
  }

  switch(type) {
    case 'POST':
      const post = db.collection('posts').doc(postID);
      await post.update({reported: true});
      db.collection('posts').doc(id).collection('reports').add(newReport); // const reports = 
      break;
    case 'COMMENT':
      const commentCollection = db.collection('posts').doc(postID).collection('comments')
      const comment = commentCollection.doc(commentID);
      await comment.update({reported: true});
      commentCollection.collection('reports').add(newReport);
      break;
    case 'USER':
      const user = db.collection('users').doc(reportedUser);
      await user.update({reported: true});
      db.collection('users').doc(reportedUser).collection('reports').add(newReport);
      break;
    default:
      // error -- return failure if error
      console.log('ERROR: Reporting type ' + type + ' is invalid.')
      break;
  }
  return; // return success if success
}


module.exports = {
  report,
  // reportPost,
  // reportComment,
  // reportUser
}