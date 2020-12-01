function topicProcessing(topicString) {
  if(topicString != undefined) {
    return topicString.split("//"); 
  } else {
    return undefined
  }
}

function answerProcessing(answerString) {
  if(answerString != undefined) {
    return answerString.split("//"); 
  } else {
    return undefined
  }
}

function postProcessing(post) {

  const postData = JSON.parse(JSON.stringify(post)); 

  let ret = {
      userID: postData.userID,
      timestamp: postData.timestamp,
      updatedTimestamp: postData.timestamp,
      type: postData.type,
      status: postData.status,
      content: {
        title: postData.title,
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
      anonymous: postData.anonymous || false,
      removed: false
  };
  for (var key of Object.keys(ret)) {
    console.log('key', key, ' - ', ret[key]);
    if(ret[key] == undefined) {
      // console.log('here')
      return null
    }
    // if(ret[key].keys()) {
    //   console.log('hi')
    // }
  } 
  return ret;
}

function editProcessing(post) {

  const postData = JSON.parse(JSON.stringify(post)); 

  let ret = {
      updatedTimestamp: postData.timestamp,
      type: postData.type,
      'content.title': postData.title,
      'content.body': postData.content,
      'content.image': postData.image,
      'content.video': postData.video,
      'content.audio': postData.audio,
      'content.topics': topicProcessing(postData.topics),
      anonymous: postData.anonymous,
      removed: postData.removed
  };
  for (var key of Object.keys(ret)) {
    console.log('key', key, ' - ', ret[key]);
    if(ret[key] == undefined) {
      delete ret[key]
    }
  } 
  console.log('ret', ret)
  return {id: postData.postID, post: ret};
}

function commentProcessing(comment) {

  const commentData = JSON.parse(JSON.stringify(comment)); 

  let ret = {
      userID: commentData.userID,
      // parentType: commentData.parentType,
      parentID: commentData.parentID,
      timestamp: commentData.timestamp,
      body: commentData.body,
      numLikes: 0,
      reported: false,
      removed: false
  };
  for (var key of Object.keys(ret)) {
    if(ret[key] == undefined) {
      return null
    }
  } 
  return ret;
}

function promptProcessing(prompt) {

  const promptData = JSON.parse(JSON.stringify(prompt)); 


  let ret = {
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

      removed: false
  };
  for (var key of Object.keys(ret)) {
    console.log('key', key, ' - ', ret[key]);
    if(ret[key] == undefined) {
      // console.log('here')
      return null
    }
  } 
  const answers = [] // assemble
  return {prompt: ret, answers: answers};
}


function userProcessing(user) {

  const userData = JSON.parse(JSON.stringify(user)); 

  let ret = {
      email: userData.email,
      username: userData.username,
      doc: userData.loginTime,
      signupTime: userData.loginTime,
      loginTime: userData.loginTime,
      type: 'MEMBER',
      consent: true,
      verified: false,
      profilePic: '',
      bio: '',
      banned: {
        duration: 0,
        timestamp: '',
        reason: '',
      },
      notifications: true,
      removed: false,
  };
  for (var key of Object.keys(ret)) {
    console.log('key', key, ' - ', ret[key]);
    if(ret[key] == undefined) {
      console.log('here')
      return null
    }
  } 
  return ret;
}

module.exports = {
  postProcessing,
  editProcessing,
  commentProcessing,
  promptProcessing,
  userProcessing
};


// liked: dbPost.likes.includes(user) ? true : false