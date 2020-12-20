const db = require("../firebase/db.js");
const middleware = require("../middleware.js")
const processing = require("../processing.js")

// Report post/comment/user
async function reportFromApp(reportData) {
  const type = reportData.body.type; // posts, comments, users
  const timestamp = reportData.body.timestamp;
  const reportingUser = reportData.body.userid;
  const reason = reportData.body.reason;
  const parentID = reportData.body.id;

  console.log('report', reportData.body)

  const newReport = {
    parentID: parentID,
    type: type,
    userID: reportingUser,
    reason: reason,
    status: 'PENDING',
    timestamp: timestamp
  }

  // separate username check for user (TODO: can just use userID instead)
  if(type == 'users') {
    console.log('username', parentID)
    const userCol = db.collection(type).where('username', '==', parentID);
    const user = await userCol.get()
    if(user.empty) { // user.size == 1
      console.log('No matching ' + type + ' document.'); 
      return 'error';
    }

    const userID = user.docs[0].id

    const userDoc = db.collection(type).doc(userID);
    await userDoc.update({reported: true});

    newReport['parentID'] = userID
    db.collection('reports').add(newReport)

  } else {
    const parent = db.collection(type).doc(parentID);
    if(!(await parent.get()).exists) {
      console.log('No matching ' + type + ' document.'); 
      return 'error';
    }
    await parent.update({reported: true});
    db.collection('reports').add(newReport)
  }

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