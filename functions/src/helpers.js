const db = require('./firebase/db.js');
const constants = require('./constants.js');
const Timestamp = require('firebase-admin').firestore.Timestamp;

function timestampToDate(timestamp) {
  if (timestamp === undefined || !timestamp) {
    return ''; // 'No timestamp.';
  }
  if (timestamp instanceof Timestamp) {
    // console.log('This is correct');
  } else {
    // console.log('This is WRONG: Timestamp');
  }

  return timestamp.toDate();
}

function dateToTimestamp(date) {
  if (!date) {
    return null;
  }

  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  return Timestamp.fromDate(date);
}

async function getUserInfo(userID, anonymous) {
  const userDoc = await db.collection('users').doc(userID).get();
  let userInfo = {};
  if (anonymous || !userDoc.exists) {
    const anonDoc = await db.collection('users').doc(constants.ANONYMOUS_ID).get();
    if (!anonDoc.exists) {
      console.log('ERROR: no Anonymous account');
      userInfo = {
        userID: constants.ANONYMOUS_ID,
        username: 'anonymous',
        profilePic: 'aloe.jpg', // link to image
        verified: true,
        age: getAge(new Date()),
        pronouns: 'any pronouns',
        sexuality: 'questioning',
      };
    } else {
      userInfo = {
        userID: constants.ANONYMOUS_ID,
        username: anonDoc.data().username,
        profilePic: anonDoc.data().profilePic,
        verified: true,
        age: getAge(timestampToDate(anonDoc.data().dob)),
        pronouns: anonDoc.data().pronouns,
        sexuality: anonDoc.data().sexuality,
      };
    }
  } else {
    userInfo = {
      userID: userID,
      username: userDoc.data().username,
      profilePic: userDoc.data().profilePic,
      verified: userDoc.data().verified,
      age: getAge(timestampToDate(userDoc.data().dob)),
      pronouns: userDoc.data().pronouns,
      sexuality: userDoc.data().sexuality,
    };
  }
  return userInfo;
}

function getAge(dob) {
  if (!dob) {
    return '';
  }

  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);

  return Math.abs(ageDt.getUTCFullYear() - 1970).toString();
}

module.exports = {
  timestampToDate,
  dateToTimestamp,
  getUserInfo,
  getAge,
};

// async function getCreated(userID, timestamp) {
//   const posts = db.collection('posts');
//   let created = [];
//   if (timestamp) {
//     created = await posts.where('userID', '==', userID).startAfter(timestamp).limit(5).get(); // .orderBy('timestamp', 'desc')
//   } else {
//     created = await posts.where('userID', '==', userID).limit(5).get();
//   }
//   if (created.empty) {
//     console.log('No matching document.');
//     return;
//   }

//   const createdPosts = [];
//   await Promise.all(created.docs.map(async (doc) => {
//     const userInfo = await getUserInfo(userID);
//     createdPosts.push(middleware.postMiddleware(doc.id, doc.data(), userInfo));
//   }));

//   return {results: createdPosts};
// }
