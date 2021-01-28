const helpers = require('./helpers.js');
const Timestamp = require('firebase-admin').firestore.Timestamp;


function timestampToDate(timestamp) {
  if (!timestamp) {
    return 'No timestamp.';
  }
  if (timestamp instanceof Timestamp) {
    console.log('This is correct');
  } else {
    console.log('This is WRONG: Timestamp');
  }

  return timestamp.toDate();
}

function adminMiddleware(id, dbPost, userInfo) {
  const ret = {
    id,
    timestamp: timestampToDate(dbPost.createdAt),
    status: dbPost.status,
    notes: dbPost.adminNotes,
    userID: dbPost.userID,
    username: userInfo.username || 'No Corresponding User', // TODO: fix
    profilePic: userInfo.profilePic || 'none',
    verified: userInfo.verified || false, // unecessary
    content: dbPost.content.body,
    topics: dbPost.content.topics,
    anonymous: dbPost.anonymous,
    likes: dbPost.numLikes,
    shares: dbPost.numShares, // TBD
  };

  return ret;
}

function userMiddleware(id, dbUser) {
  const ret = {
    userid: id,
    username: dbUser.username,
    verified: dbUser.verified,
    profilePicture: dbUser.profilePic || '',
    dob: dbUser.dob || '',
    age: helpers.getAge(dbUser.dob),
    pronouns: dbUser.pronouns || '',
    sexuality: dbUser.sexuality || '',
    email: dbUser.email,
    doc: dbUser.signupTime,
    consentSetting: dbUser.consent,
    notifSettings: dbUser.notifications || true,
  };
  return ret;
}

function profileMiddleware(id, dbUser) {
  const ret = {
    userid: id,
    username: dbUser.username,
    verified: dbUser.verified || false,
    profilePicture: dbUser.profilePic || '',
    doc: dbUser.signupTime,
    age: helpers.getAge(dbUser.dob),
    pronouns: dbUser.pronouns || '',
    sexuality: dbUser.sexuality || '',
  };
  return ret;
}

function postMiddleware(id, dbPost, userInfo) {
  const ret = {
    id,
    timestamp: timestampToDate(dbPost.createdAt), // updated too?
    status: dbPost.status,
    userid: userInfo.userID,
    user: userInfo.username,
    profilePicture: userInfo.profilePic || '',
    verified: userInfo.verified || false,
    age: userInfo.age || '',
    pronouns: userInfo.pronouns || '',
    sexuality: userInfo.sexuality || '',
    content: dbPost.content.body,
    topics: dbPost.content.topics,
    anonymous: dbPost.anonymous,
    likes: dbPost.numLikes,
    shares: dbPost.numShares,
  };
  return ret;
}

function promptMiddleware(id, dbPrompt, userInfo, topResponse) {
  const ret = {
    id,
    timestamp: timestampToDate(dbPrompt.createdAt), // updated too?
    userid: userInfo.userID,
    user: userInfo.username,
    profilePicture: userInfo.profilePic || '',
    verified: userInfo.verified || false,
    question: dbPrompt.prompt,
    image: dbPrompt.image,
    topics: dbPrompt.topics,
    likes: dbPrompt.numLikes,
    shares: dbPrompt.numShares,
    responses: dbPrompt.numResponses,
    topResponse: topResponse,
  };
  return ret;
}

function responseMiddleware(id, dbResponse, userInfo) {
  const ret = {
    id,
    user: userInfo.username,
    profilePicture: userInfo.profilePic || '',
    verified: userInfo.verified || false,
    content: dbResponse.body,
    likes: dbResponse.numLikes,
    timestamp: timestampToDate(dbResponse.createdAt),
    top: false, // TODO design
  };
  return ret;
}

function reportMiddleware(id, dbReport) {
  const ret = {
    id,
    userID: dbReport.userID,
    parentID: dbReport.parentID,
    type: dbReport.type,
    reason: dbReport.reason || 'What is the reason??',
    timestamp: timestampToDate(dbReport.createdAt),
    status: dbReport.status,
  };

  return ret;
}

function resourceMiddleware(id, dbResource) {
  const ret = {
    id,
    name: dbResource.name,
    type: dbResource.type,
    contact: dbResource.contact,
    description: dbResource.description,
    confidentiality: dbResource.confidentiality,
  };
  return ret;
}


module.exports = {
  adminMiddleware,
  userMiddleware,
  profileMiddleware,
  postMiddleware,
  promptMiddleware,
  responseMiddleware,
  reportMiddleware,
  resourceMiddleware,
};

// function surveyMiddleware(id, dbPrompt, answers) {

// //     let ret = {
// //         id,
// //         timestamp: dbPrompt.timestamp,
// //         question: dbPrompt.prompt,
// //         image: dbPrompt.image,
// //         topics: dbPrompt.topics,
// //         numLikes: dbPrompt.numLikes,
// //         numShares: dbPrompt.numShares,
// //         numAnswers: dbPrompt.numAnswers,
// //         numResponses: dbPrompt.numResponses,
// //         answers: answers,
// //     };
// //     return ret;
// // }

// function answerMiddleware(id, dbAnswer) {
//   const ret = {
//     id,
//     // timestamp: dbAnswer.timestamp,
//     content: dbAnswer.content,
//     choice: dbAnswer.choice,
//     // users later
//   };
//   return ret;
// }

// liked: dbPost.likes.includes(user) ? true :

// function surveyMiddleware(id, dbPrompt, answers) {

//     let ret = {
//         id,
//         timestamp: dbPrompt.timestamp,
//         question: dbPrompt.question,
//         answers: fakeAnswers, // answers

//         // topics: dbPrompt.topics,
//         // status: dbPost.status,
//         // user: dbPost.username,
//         // likes: dbPost.likes,
//         // saves: dbPost.saves,
//         // shares: dbPost.shares,
//     };
//     return ret;
// }

// add image later + content instead of body
// const fakeComments = [
//   {
//     id: '123',
//     user: 'sidthekid',
//     content: 'You are so strong <3',
//     likes: ['oj', 'sid'],
//     timestamp: 'November Yomama',
//   },
//   {
//     id: '0001',
//     user: 'sidthekid',
//     content: 'This is amazing!',
//     likes: ['yomama', 'sid', 'porky', 'joebiden'],
//     timestamp: 'October Yodada',
//   },
// ];

// const fakeResponses = [
//   {
//     id: '123',
//     user: 'sidthekid',
//     content: 'I think Euphoria romanticized unhealthy relationships.',
//     likes: ['oj', 'sid'],
//     timestamp: 'November Yomama',
//   },
//   {
//     id: '0001',
//     user: 'sidthekid',
//     content: 'Episode 5 really triggered me.',
//     likes: ['yomama', 'sid', 'porky', 'joebiden'],
//     timestamp: 'October Yodada',
//   },
// ];

// const fakeAnswers = [
//   {
//     id: '123',
//     choice: 'A',
//     content: 'Yes!',
//     users: ['oj', 'cam'],
//   },
//   {
//     id: '999',
//     choice: 'B',
//     content: 'No.',
//     users: ['oj', 'sid'],
//   },
// ];

// const ret = {
//   id,
//   type: dbResource.type,
//   name: dbResource.name,
//   phone: dbResource.contact.phone || 'none',
//   text: dbResource.contact.text || 'none',
//   email: dbResource.contact.email || 'none',
//   website: dbResource.contact.website || 'none',
//   address: dbResource.contact.address || 'none',
//   summary: dbResource.description.summary,
//   confidentiality: dbResource.description.confidentiality,
//   reporting: dbResource.description.reporting,
//   image: dbResource.image,
// };
