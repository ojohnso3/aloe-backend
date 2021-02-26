const helpers = require('./helpers.js');

function getAge(timestamp) {
  if (!timestamp) {
    return '';
  }
  const dob = helpers.timestampToDate(timestamp);
  return helpers.getAge(dob);
}

function adminMiddleware(id, dbPost, userInfo) {
  const ret = {
    id,
    timestamp: helpers.timestampToDate(dbPost.createdAt),
    status: dbPost.status,
    notes: dbPost.adminNotes,
    userID: dbPost.userID,
    username: userInfo.username || 'No Corresponding User', // TODO: fix
    profilePic: userInfo.profilePic || 'none',
    verified: userInfo.verified || false, // unecessary
    content: dbPost.content.body,
    topics: dbPost.content.topics,
    anonymous: dbPost.anonymous,
    blurred: dbPost.blurred,
    likes: dbPost.numLikes,
    shares: dbPost.numShares, // TBD
  };

  return ret;
}

function userMiddleware(id, dbUser) {
  const ret = {
    userid: id,
    username: dbUser.username,
    type: dbUser.type,
    verified: dbUser.verified,
    profilePicture: dbUser.profilePic || '',
    dob: helpers.timestampToDate(dbUser.dob) || '',
    age: getAge(dbUser.dob),
    pronouns: dbUser.pronouns || '',
    sexuality: dbUser.sexuality || '',
    triggers: dbUser.triggers || [],
    email: dbUser.email,
    doc: helpers.timestampToDate(dbUser.doc),
    consentSetting: dbUser.consent,
    notifSettings: dbUser.notifications || true,
  };

  // console.log('TRIGGERS HERE', ret.triggers);
  return ret;
}

function profileMiddleware(id, dbUser) {
  const ret = {
    userid: id,
    username: dbUser.username,
    verified: dbUser.verified || false,
    profilePicture: dbUser.profilePic || '',
    doc: helpers.timestampToDate(dbUser.doc),
    age: getAge(dbUser.dob),
    pronouns: dbUser.pronouns || '',
    sexuality: dbUser.sexuality || '',
  };
  return ret;
}

function postMiddleware(id, dbPost, userInfo) {
  const ret = {
    id,
    timestamp: helpers.timestampToDate(dbPost.updatedAt), // created too?
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
    blurred: dbPost.blurred,
    likes: dbPost.numLikes,
    shares: dbPost.numShares,
    notes: dbPost.adminNotes,
  };
  // console.log('check BLURRED here', ret.blurred);
  return ret;
}

function promptMiddleware(id, dbPrompt, userInfo, topResponse) {
  const ret = {
    id,
    timestamp: helpers.timestampToDate(dbPrompt.updatedAt), // created too?
    userid: userInfo.userID,
    user: userInfo.username,
    profilePicture: userInfo.profilePic || '',
    verified: userInfo.verified || true,
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
    userid: userInfo.userID,
    user: userInfo.username,
    profilePicture: userInfo.profilePic || '',
    verified: userInfo.verified || false,
    content: dbResponse.body,
    anonymous: dbResponse.anonymous,
    likes: dbResponse.numLikes,
    timestamp: helpers.timestampToDate(dbResponse.createdAt), // updated at?
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
    timestamp: helpers.timestampToDate(dbReport.createdAt), // updated at?
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
