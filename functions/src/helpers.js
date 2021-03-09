const db = require('./firebase/db.js');
const constants = require('./constants.js');
const Timestamp = require('firebase-admin').firestore.Timestamp;
const FieldValue = require('firebase-admin').firestore.FieldValue;
const csvtojson = require('csvtojson');
const functions = require('firebase-functions');
const admin = require('./firebase/admin');
// FieldValue.serverTimestamp()

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

function getTimeFromNow(timestamp) {
  const date = timestampToDate(timestamp);
  if (!date || date === '') {
    return '';
  }

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) {
    return '';
  }

  const seconds = Math.round(diffMs / 1000); // absolute value??
  if (seconds < 60) {
    return seconds + 's';
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return minutes + 'm';
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return hours + 'h';
  }

  const days = Math.round(hours / 24);
  if (days < 7) {
    return days + 'd';
  }

  const weeks = Math.round(days / 7);
  return weeks + 'w';
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

async function sendPushNotification(token, type, userID, anonymous, prompt) {
  // TODO: comment out when deploying
  if (!process.env.PRODUCTION) {
    console.log('Cannot send notifications on TESTING');
    return;
  }

  if (!token || token === '') {
    return;
  }

  let title;
  let body;
  let user;
  let username;

  // STORYLIKE, RESPONSELIKE, REPLY, APPROVED, REJECTED
  switch (type) {
    case 'STORYLIKE':
      user = await getUserInfo(userID, anonymous);
      username = user.username;

      body = username + ' has liked your story!';
      break;
    case 'RESPONSELIKE':
      user = await getUserInfo(userID, anonymous);
      username = user.username;

      // title = prompt;
      body = username + ' has liked your response!';
      break;
    case 'REPLY':
      user = await getUserInfo(userID, anonymous);
      username = user.username;

      title = prompt;
      body = username + ' has replied to your response!';
      break;
    case 'APPROVED':
      title = 'Your story has been approved!';
      body = 'Come check out your story on the feed :)';
      break;
    case 'REJECTED':
      title = 'Your story has been declined :(';
      body = 'Please review our notes and resubmit!';
      break;
    default:
  }

  // body = 'Click on this notification to return to Aloe :)';

  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token,
  };

  if (!message.notification.title) {
    delete message.notification.title;
  }

  // console.log('message', message);

  // Send a message to the device corresponding to the provided registration token.
  admin.messaging().send(message)
      .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
}

module.exports = {
  timestampToDate,
  dateToTimestamp,
  getTimeFromNow,
  getUserInfo,
  getAge,
  sendPushNotification,
  csvtojson,
  functions,
  Timestamp,
  FieldValue,
};
