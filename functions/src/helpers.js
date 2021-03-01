const db = require('./firebase/db.js');
const constants = require('./constants.js');
const Timestamp = require('firebase-admin').firestore.Timestamp;
// firebase.firestore.FieldValue.serverTimestamp()
const FieldValue = require('firebase-admin').firestore.FieldValue;
const csvtojson = require('csvtojson');


function timestampToDate(timestamp) {
  if (timestamp === undefined || !timestamp) {
    return '';
  }
  // NOTE: timezone differences
  if (timestamp instanceof Timestamp) { 
    return timestamp.toDate();
  } else {
    return new Date(timestamp);
  }
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
        username: 'Anonymous',
        profilePic: '',
        verified: true,
        age: '',
        pronouns: '',
        sexuality: '',
      };
    } else {
      userInfo = {
        userID: constants.ANONYMOUS_ID,
        username: anonDoc.data().username,
        profilePic: anonDoc.data().profilePic,
        verified: anonDoc.data().anonymous,
        age: '',
        pronouns: '',
        sexuality: '',
      };
    }
  } else {
    userInfo = {
      userID: userID,
      username: userDoc.data().username,
      profilePic: userDoc.data().profilePic,
      verified: userDoc.data().verified,
      age: getAge(timestampToDate(userDoc.data().dob)) || '',
      pronouns: userDoc.data().pronouns || '',
      sexuality: userDoc.data().sexuality || '',
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
  csvtojson,
  Timestamp,
  FieldValue,
};
