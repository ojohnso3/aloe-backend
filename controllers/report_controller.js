const db = require("../db.js");
const middleware = require("../middleware.js")
const processing = require("../processing.js")

// Report post/comment/user
async function reportFromApp(reportData) {
  const type = reportData.body.type; // POST, COMMENT, USER -- collection
  const timestamp = reportData.body.timestamp;
  const reportingUser = reportData.body.user1;
  const reason = reportData.body.reason;

  const parentID = reportData.body.parentID;

  const newReport = {
    parentID: parentID,
    type: type,
    userID: reportingUser,
    reason: reason,
    status: 'PENDING',
    timestamp: timestamp
  }

  switch(type) {
    case 'POST':
      const post = db.collection('posts').doc(parentID);
      if(!(await post.get()).exists) {
        console.log('No matching post document.'); 
        return 'error';
      }
      await post.update({reported: true});
      break;
    case 'COMMENT':
      const comment = db.collection('comments').doc(parentID);
      if(!(await comment.get()).exists) {
        console.log('No matching comment document.'); 
        return 'error';
      }
      await comment.update({reported: true});
      break;
    case 'USER':
      const user = db.collection('users').doc(parentID);
      if(!(await user.get()).exists) {
        console.log('No matching user document.'); 
        return 'error';
      }
      await user.update({reported: true});
      break;
    default:
      console.log('ERROR: Reporting type ' + type + ' is invalid.')
      return 'error';
  }
  db.collection('reports').add(newReport)
  return 'success'; // return success if success
}


module.exports = {
  reportFromApp,
  // reportPost,
  // reportComment,
  // reportUser
}

// switch(type) {
//   case 'POST':
//     await db.collection('posts').doc(postID).update({reported: true});
//     db.collection('posts').doc(id).collection('reports').add(newReport);
//     break;
//   case 'COMMENT':
//     const commentCollection = db.collection('posts').doc(postID).collection('comments').doc(commentID);
//     const comment = commentCollection;
//     await comment.update({reported: true});
//     commentCollection.collection('reports').add(newReport);
//     break;
//   case 'USER':
//     const user = db.collection('users').doc(reportedUser);
//     await user.update({reported: true});
//     db.collection('users').doc(reportedUser).collection('reports').add(newReport);
//     break;
//   default:
//     // error -- return failure if error
//     console.log('ERROR: Reporting type ' + type + ' is invalid.')
//     break;
// }