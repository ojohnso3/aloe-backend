const constants = require('./constants.js');
const helpers = require('./helpers.js');

function processIdentity(string) {
  if (string === 'Prefer not to answer') {
    return '';
  } else {
    return string;
  }
}

function topicParser(topicString) {
  if (Array.isArray(topicString)) {
    return topicString;
  }

  if (topicString !== undefined) {
    return topicString.split('//');
  } else {
    return undefined;
  }
}

function userProcessing(user, uid) {
  const userData = JSON.parse(JSON.stringify(user));

  const timestamp = helpers.Timestamp.now();

  const ret = {
    uid: uid,
    username: userData.username,
    doc: timestamp,
    loginTime: timestamp,
    type: 'USER',
    consent: userData.consent || false,
    verified: false,
    profilePic: '',
    banned: {
      duration: 0,
      timestamp: '',
      reason: '',
    },
    notifications: true,
    removed: false,
  };

  for (const key of Object.keys(ret)) {
    if (ret[key] === undefined) {
      return null;
    }
  }
  return ret;
}

function profileProcessing(profile) {
  const profileData = JSON.parse(JSON.stringify(profile));

  if (profileData.consent === '1') {
    profileData.consent = true;
  } else if (profileData.consent === '0') {
    profileData.consent = false;
  }

  const ret = {
    username: profileData.username,
    consent: profileData.consent,
    profilePic: profileData.profilePic,
    pronouns: processIdentity(profileData.pronouns),
    sexuality: processIdentity(profileData.sexuality),
    triggers: topicParser(profileData.triggers),
  };

  for (const key of Object.keys(ret)) {
    if (ret[key] === '' || ret[key] === undefined) {
      delete ret[key];
    }
  }

  return ret;
}

function postProcessing(post) {
  const postData = JSON.parse(JSON.stringify(post));
  let anonymous = true;
  if (postData.anonymous === '0') {
    anonymous = false;
  }
  let blurred = false;
  if (postData.blurred === '1') {
    blurred = true;
  }
  const ret = {
    userID: postData.userid,
    createdAt: helpers.Timestamp.now(),
    updatedAt: helpers.Timestamp.now(),
    status: constants.PENDING,
    content: {
      body: postData.content,
      topics: topicParser(postData.topics),
    },
    numLikes: 0,
    numShares: 0,
    numResponses: 0,
    anonymous: anonymous,
    blurred: blurred || false,
    reported: false,
    removed: false,
    adminNotes: '',
  };
  for (const key of Object.keys(ret)) {
    if (ret[key] === undefined) {
      return null;
    }
  }
  return ret;
}

// NOTE: not currently used
function editProcessing(post) {
  const postData = JSON.parse(JSON.stringify(post));

  const ret = {
    'updatedAt': helpers.Timestamp.now(),
    'content.body': postData.content,
    'content.topics': topicParser(postData.topics),
    'anonymous': postData.anonymous,
    'removed': postData.removed,
  };
  for (const key of Object.keys(ret)) {
    if (ret[key] === undefined) {
      delete ret[key];
    }
  }
  return {id: postData.postID, post: ret};
}

function responseProcessing(response) {
  const responseData = JSON.parse(JSON.stringify(response));

  let anonymous = true;
  if (responseData.anonymous === '0') {
    anonymous = false;
  }

  const ret = {
    userID: responseData.userid,
    parentID: responseData.id,
    replies: 0,
    replyID: responseData.replyTo || '',
    createdAt: helpers.Timestamp.now(),
    updatedAt: helpers.Timestamp.now(),
    body: responseData.body,
    anonymous: anonymous,
    numLikes: 0,
    reported: false,
    removed: false,
    top: false,
  };

  for (const key of Object.keys(ret)) {
    if (ret[key] === undefined) {
      return null;
    }
  }
  return ret;
}

function promptProcessing(prompt) {
  const promptData = JSON.parse(JSON.stringify(prompt));

  const ret = {
    createdAt: helpers.dateToTimestamp(promptData.timestamp) || helpers.Timestamp.now(),
    updatedAt: helpers.Timestamp.now(),
    userID: constants.ALOE_ID,
    prompt: promptData.prompt,
    image: promptData.image,
    topics: [],
    numLikes: 0,
    numShares: 0,
    numResponses: 0,
    removed: false,
  };
  for (const key of Object.keys(ret)) {
    if (ret[key] === undefined) {
      return null;
    }
  }
  return {prompt: ret};
}

function topicProcessing(topics) {
  const topicsData = JSON.parse(JSON.stringify(topics));

  if (!topicsData.topic) {
    return null;
  }

  const ret = {
    topic: topicsData.topic,
    description: topicsData.description || 'Definition will be uploaded soon!',
    createdAt: helpers.dateToTimestamp(topicsData.timestamp) || helpers.Timestamp.now(),
    updatedAt: helpers.Timestamp.now(),
    source: topicsData.source,
  };

  for (const key of Object.keys(ret)) {
    if (ret[key] === undefined) {
      delete ret[key]; // be careful of returning an empty object
    }
  }

  return ret;
}

function universityProcessing(university) {
  const uniData = JSON.parse(JSON.stringify(university));

  if (!uniData.university || !uniData.userid) {
    return null;
  }

  const ret = {
    university: uniData.university,
    userID: uniData.userid,
    createdAt: helpers.Timestamp.now(),
  };

  return ret;
}

module.exports = {
  userProcessing,
  profileProcessing,
  postProcessing,
  editProcessing,
  responseProcessing,
  promptProcessing,
  topicProcessing,
  universityProcessing,
};
