function topicProcessing(topicString) {
  if (topicString != undefined) {
    return topicString.split('//');
  } else {
    return undefined;
  }
}

function answerProcessing(answerString) {
  if (answerString != undefined) {
    return answerString.split('//');
  } else {
    return undefined;
  }
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
    status: 'PENDING',
    content: {
      body: postData.content,
      image: postData.image || '',
      video: postData.video || '',
      audio: postData.audio || '',
      topics: topicProcessing(postData.topics),
    },
    numLikes: 0,
    numShares: 0,
    numComments: 0,
    reported: false,
    anonymous: anonymous,
    removed: false,
    adminNotes: ''
  };
  console.log("post ret", ret);
  for (const key of Object.keys(ret)) {
    console.log('key', key, ' - ', ret[key]);
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
    'type': postData.type,
    'content.body': postData.content,
    'content.image': postData.image,
    'content.video': postData.video,
    'content.audio': postData.audio,
    'content.topics': topicProcessing(postData.topics),
    'anonymous': postData.anonymous,
    'removed': postData.removed,
  };
  for (const key of Object.keys(ret)) {
    console.log('key', key, ' - ', ret[key]);
    if (ret[key] == undefined) {
      delete ret[key];
    }
  }
  console.log('ret', ret);
  return {id: postData.postID, post: ret};
}

function commentProcessing(comment) {
  const commentData = JSON.parse(JSON.stringify(comment));

  console.log('commendData', commentData);

  const ret = {
    userID: commentData.userid,
    // parentType: commentData.parentType,
    parentID: commentData.id,
    timestamp: commentData.timestamp,
    body: commentData.body,
    numLikes: 0,
    reported: false,
    removed: false,
  };
  for (const key of Object.keys(ret)) {
    console.log('key pee', ret[key]);
    if (ret[key] == undefined) {
      console.log('whyy', ret[key]);
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
    userID: 'xOi20I8ehuqyhKdwt6wh',
    prompt: promptData.prompt,
    image: promptData.image,
    topics: promptData.topics,
    numLikes: 0,
    numShares: 0,
    numResponses: 0,
    numAnswers: promptData.numAnswers,

    removed: false,
  };
  for (const key of Object.keys(ret)) {
    console.log('key', key, ' - ', ret[key]);
    if (ret[key] == undefined) {
      // console.log('here')
      return null;
    }
  }
  const answers = []; // assemble
  return {prompt: ret, answers: answers};
}


function userProcessing(user) {
  const userData = JSON.parse(JSON.stringify(user));

  const ret = {
    email: userData.email,
    username: userData.username,
    doc: userData.loginTime,
    signupTime: userData.loginTime,
    loginTime: userData.loginTime,
    type: 'MEMBER',
    consent: true, // change maybe?
    verified: false,
    profilePic: '',
    age: userData.age || '20', // adding more info
    pronouns: userData.pronouns || 'pronouns',
    sexuality: userData.sexuality || 'bisexual',
    bio: '',
    banned: {
      duration: 0,
      timestamp: '',
      reason: '',
    },
    notifications: true,
    removed: false,
  };
  for (const key of Object.keys(ret)) {
    console.log('key', key, ' - ', ret[key]);
    if (ret[key] == undefined) {
      console.log('here');
      return null;
    }
  }
  return ret;
}

function profileProcessing(profile) {
  const profileData = JSON.parse(JSON.stringify(profile));

  if (profileData.consent) {
    profileData.consent = true;
  } else {
    profileData.consent = false;
  }
  console.log('cons', profileData.consent);

  const ret = {
    username: profileData.username,
    consent: profileData.consent,
    profilePic: profileData.profilePic,
    bio: profileData.bio,
  };
  for (const key of Object.keys(ret)) {
    console.log('key', key, ' - ', ret[key]);
    if (ret[key] == '' || ret[key] == undefined) {
      delete ret[key];
    }
  }
  return ret;
}

module.exports = {
  postProcessing,
  editProcessing,
  commentProcessing,
  promptProcessing,
  userProcessing,
  profileProcessing,
};


// liked: dbPost.likes.includes(user) ? true : false
