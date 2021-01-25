const constants = require('./constants.js');

function topicParser(topicString) {
  if (topicString != undefined) {
    return topicString.split('//');
  } else {
    return undefined;
  }
}

function userProcessing(user) {
  const userData = JSON.parse(JSON.stringify(user));

  const ret = {
    email: userData.email,
    username: userData.username,
    doc: userData.loginTime,
    signupTime: userData.loginTime,
    loginTime: userData.loginTime,
    type: 'USER',
    consent: userData.consent || true, // change eventually?
    verified: false,
    profilePic: '',
    dob: userData.dob || '',
    pronouns: userData.pronouns || '',
    sexuality: userData.sexuality || '',
    banned: {
      duration: 0,
      timestamp: '',
      reason: '',
    },
    notifications: true,
    removed: false,
  };
  for (const key of Object.keys(ret)) {
    // console.log('key', key, ' - ', ret[key]);
    if (ret[key] == undefined) {
      return null;
    }
  }
  return ret;
}

function profileProcessing(profile) {
  const profileData = JSON.parse(JSON.stringify(profile));

  if (profileData.consent) { // 0 vs 1 CHECK
    profileData.consent = true;
  } else {
    profileData.consent = false;
  }

  const ret = {
    username: profileData.username,
    consent: profileData.consent,
    profilePic: profileData.profilePic,
    dob: profileData.dob,
    pronouns: profileData.pronouns,
    sexuality: profileData.sexuality,
  };
  for (const key of Object.keys(ret)) {
    // console.log('key', key, ' - ', ret[key]);
    if (ret[key] == '' || ret[key] == undefined) {
      delete ret[key];
    }
  }
  return ret;
}

function postProcessing(post) {
  const postData = JSON.parse(JSON.stringify(post));

  var anonymous = true;
  if (postData.anonymous == '0') {
    anonymous = false;
  }

  const ret = {
    userID: postData.userid,
    timestamp: postData.timestamp,
    updatedTimestamp: postData.timestamp,
    status: constants.PENDING,
    content: {
      body: postData.content,
      topics: topicParser(postData.topics),
    },
    numLikes: 0,
    numShares: 0,
    numComments: 0,
    anonymous: anonymous,
    reported: false,
    removed: false,
    adminNotes: ''
  };

  for (const key of Object.keys(ret)) {
    // console.log('key', key, ' - ', ret[key]);
    if (ret[key] == undefined) {
      return null;
    }
  }
  return ret;
}

function editProcessing(post) {
  const postData = JSON.parse(JSON.stringify(post));

  const ret = {
    'updatedTimestamp': postData.timestamp,
    'content.body': postData.content,
    'content.topics': topicParser(postData.topics),
    'anonymous': postData.anonymous,
    'removed': postData.removed,
  };
  for (const key of Object.keys(ret)) {
    // console.log('key', key, ' - ', ret[key]);
    if (ret[key] == undefined) {
      delete ret[key];
    }
  }

  return {id: postData.postID, post: ret};
}

function commentProcessing(comment) {
  const commentData = JSON.parse(JSON.stringify(comment));

  console.log('commentData', commentData);

  const ret = {
    userID: commentData.userid,
    parentID: commentData.id,
    timestamp: commentData.timestamp,
    body: commentData.body,
    numLikes: 0,
    reported: false,
    removed: false,
    top: false // TODO design
  };
  for (const key of Object.keys(ret)) {
    // console.log('key', ret[key]);
    if (ret[key] == undefined) {
      return null;
    }
  }
  return ret;
}

function promptProcessing(prompt) {
  const promptData = JSON.parse(JSON.stringify(prompt));

  const ret = {
    timestamp: promptData.timestamp,
    updatedTimestamp: promptData.timestamp,
    userID: constants.ALOE_ID,
    prompt: promptData.prompt,
    image: promptData.image,
    topics: promptData.topics,
    numLikes: 0,
    numShares: 0,
    numResponses: 0,
    removed: false,
  };
  for (const key of Object.keys(ret)) {
    if (ret[key] == undefined) {
      return null;
    }
  }
  return {prompt: ret};
}

function topicsProcessing(topics) {
  const topicsData = JSON.parse(JSON.stringify(topics));
  
  if(!topicsData.topic) {
    return null;
  }

  const ret = {
    topic: topicsData.topic,
    description: topicsData.description || 'User-added Topic. Definition will be uploaded soon!',
    timestamp: topicsData.timestamp || new Date(),
    source: topicsData.source || 'USER',
  };

  return ret;
}

module.exports = {
  userProcessing,
  profileProcessing,
  postProcessing,
  editProcessing,
  commentProcessing,
  promptProcessing,
  topicsProcessing,
};


// liked: dbPost.likes.includes(user) ? true : false
// function answerProcessing(answerString) {
//   if (answerString != undefined) {
//     return answerString.split('//');
//   } else {
//     return undefined;
//   }
// }

  // numAnswers: promptData.numAnswers, answers: answers
  // const answers = []; // assemble