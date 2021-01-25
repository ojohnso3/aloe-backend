const db = require('./firebase/db.js');
const constants = require('./constants.js');


async function getUserInfo(userID, anonymous) {
  const userDoc = await db.collection('users').doc(userID).get();
  let userInfo = {};
  if (anonymous || !userDoc.exists) {
    const anonDoc = await db.collection('users').doc(constants.ANONYMOUS_ID).get();
    if (!anonDoc.exists) {
      console.log('ERROR: no Anonymous account');
      userInfo = {
        userID: constants.ANONYMOUS_ID,
        username: 'Anonymous',
        profilePic: 'aloe.jpg', // link to image
        verified: true,
      };
    } else {
      userInfo = {
        userID: constants.ANONYMOUS_ID,
        username: anonDoc.data().username,
        profilePic: anonDoc.data().profilePic,
        verified: true,
      };
    }
  } else {
    userInfo = {
      userID: userID,
      username: userDoc.data().username,
      profilePic: userDoc.data().profilePic,
      verified: userDoc.data().verified,
      age: getAge(userDoc.data().dob),
      pronouns: userDoc.data().pronouns,
      sexuality: userDoc.data().sexuality,
    };
  }
  return userInfo;
}

function getAge(dob) {
  if(!dob) {
    return '';
  }
  var diff_ms = Date.now() - dob.getTime();
  var age_dt = new Date(diff_ms); 

  return Math.abs(age_dt.getUTCFullYear() - 1970);
}

module.exports = {
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