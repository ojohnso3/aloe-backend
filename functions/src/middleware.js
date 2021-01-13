const helpers = require('./helpers.js');


// add image later + content instead of body
const fakeComments = [
  {
    id: '123',
    user: 'sidthekid',
    content: 'You are so strong <3',
    likes: ['oj', 'sid'],
    timestamp: 'November Yomama',
  },
  {
    id: '0001',
    user: 'sidthekid',
    content: 'This is amazing!',
    likes: ['yomama', 'sid', 'porky', 'joebiden'],
    timestamp: 'October Yodada',
  },
];

const fakeResponses = [
  {
    id: '123',
    user: 'sidthekid',
    content: 'I think Euphoria romanticized unhealthy relationships.',
    likes: ['oj', 'sid'],
    timestamp: 'November Yomama',
  },
  {
    id: '0001',
    user: 'sidthekid',
    content: 'Episode 5 really triggered me.',
    likes: ['yomama', 'sid', 'porky', 'joebiden'],
    timestamp: 'October Yodada',
  },
];

const fakeAnswers = [
  {
    id: '123',
    choice: 'A',
    content: 'Yes!',
    users: ['oj', 'cam'],
  },
  {
    id: '999',
    choice: 'B',
    content: 'No.',
    users: ['oj', 'sid'],
  },
];


function adminMiddleware(id, dbPost, userInfo) {

  const ret = {
    id,
    timestamp: dbPost.timestamp,
    status: dbPost.status,
    notes: dbPost.adminNotes,
    userID: dbPost.userID,
    username: userInfo.username || 'No Corresponding User',
    profilePic: userInfo.profilePic || 'none',
    verified: userInfo.verified || false, // unecessary
    content: dbPost.content.body,
    media: dbPost.content.image || 'none',
    topics: dbPost.content.topics,
    anonymous: dbPost.topics
    // likes: dbPost.numLikes,
    // shares: dbPost.numShares,
    // comments: dbPost.numComments
  };

  return ret;
}

function postMiddleware(id, dbPost, userInfo) {
  // anonymous shit
  let username = userInfo.username; ;
  if (dbPost.anonymous || !username) {
    username = 'Anonymous';
  };

  const ret = {
    id,
    timestamp: dbPost.timestamp,
    status: dbPost.status,
    userid: userInfo.userID,
    user: username,
    profilePicture: userInfo.profilePic || 'none',
    verified: userInfo.verified || false,
    age: userInfo.age, // adding more info
    pronouns: userInfo.pronouns,
    sexuality: userInfo.sexuality,
    content: dbPost.content.body,
    image: dbPost.content.image || 'none',
    video: dbPost.content.video || 'none',
    audio: dbPost.content.audio || 'none',
    topics: dbPost.content.topics,
    likes: dbPost.numLikes,
    shares: dbPost.numShares,
    comments: dbPost.numComments,
    anonymous: dbPost.anonymous,
  };
  return ret;
}

function promptMiddleware(id, dbPrompt, answers) {
  const ret = {
    id,
    timestamp: dbPrompt.timestamp,
    // username: 'aloe_official',
    question: dbPrompt.prompt,
    image: dbPrompt.image,
    topics: dbPrompt.topics,
    likes: dbPrompt.numLikes,
    shares: dbPrompt.numShares,
    comments: dbPrompt.numResponses,
    answers: answers || [],
  };
  return ret;
}

// function surveyMiddleware(id, dbPrompt, answers) {

//     let ret = {
//         id,
//         timestamp: dbPrompt.timestamp,
//         question: dbPrompt.prompt,
//         image: dbPrompt.image,
//         topics: dbPrompt.topics,
//         numLikes: dbPrompt.numLikes,
//         numShares: dbPrompt.numShares,
//         numAnswers: dbPrompt.numAnswers,
//         numResponses: dbPrompt.numResponses,
//         answers: answers,
//     };
//     return ret;
// }

function answerMiddleware(id, dbAnswer) {
  const ret = {
    id,
    // timestamp: dbAnswer.timestamp,
    content: dbAnswer.content,
    choice: dbAnswer.choice,
    // users later
  };
  return ret;
}

function commentMiddleware(id, dbComment, userInfo) {
  const ret = {
    id,
    user: userInfo.username || 'Anonymous',
    profilePicture: userInfo.profilePic || 'none',
    verified: userInfo.verified || false,
    content: dbComment.body,
    likes: dbComment.numLikes,
    timestamp: dbComment.timestamp,
  };
  return ret;
}

function resourceMiddleware(id, dbResource) {
  const ret = {
    id,
    type: dbResource.type,
    name: dbResource.name,
    phone: dbResource.contact.phone || 'none',
    text: dbResource.contact.text || 'none',
    email: dbResource.contact.email || 'none',
    website: dbResource.contact.website || 'none',
    address: dbResource.contact.address || 'none',
    summary: dbResource.description.summary,
    confidentiality: dbResource.description.confidentiality,
    reporting: dbResource.description.reporting,
    image: dbResource.image,
  };
  return ret;
}


function userMiddleware(id, dbUser) {
  // const created = helpers.getCreated(id);

  const ret = {
    userid: id,
    username: dbUser.username,
    verified: dbUser.verified,
    profilePicture: dbUser.profilePic || 'none',
    bio: dbUser.bio || 'none',
    age: dbUser.age || '22', // adding more info
    pronouns: dbUser.pronouns || 'male',
    sexuality: dbUser.sexuality || 'asexual',
    type: dbUser.type,
    email: dbUser.email,
    doc: dbUser.signupTime,
    consentSetting: dbUser.consent,
    notifSettings: dbUser.notifSettings,
    posts: [], // created
    liked: [], // remove

  };
  return ret;
}

function profileMiddleware(id, dbUser) {
  const ret = {
    userid: id,
    username: dbUser.username,
    verified: dbUser.verified,
    profilePicture: dbUser.profilePic || 'none',
    bio: dbUser.bio || 'none',
    doc: dbUser.signupTime,
    age: dbUser.age || '19', // adding more info
    pronouns: dbUser.pronouns || 'pronouns',
    sexuality: dbUser.sexuality || 'gay',
  };
  return ret;
}


module.exports = {
  adminMiddleware,
  postMiddleware,
  promptMiddleware,
  // surveyMiddleware,
  answerMiddleware,
  commentMiddleware,
  resourceMiddleware,
  userMiddleware,
  profileMiddleware,
};


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
