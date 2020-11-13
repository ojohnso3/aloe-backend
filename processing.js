function topicProcessing(topicString) {
  return topicString.split("+"); 
}

function postProcessing(post) {

  const postData = JSON.parse(JSON.stringify(post)); 

  let ret = {
      username: postData.user,
      timestamp: postData.timestamp,
      updatedTimestamp: '',
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
      likes: [],
      // comments: []
      // anonymous: dbPost.anonymous
  };
  return ret;
}

function commentProcessing(post) {

  const postData = JSON.parse(JSON.stringify(post)); 

  let ret = {
      username: postData.user,
      timestamp: postData.timestamp,
      updatedTimestamp: '',
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
      likes: [],
      // comments: []
      // anonymous: dbPost.anonymous
  };
  return ret;
}

module.exports = {
  postProcessing
};


// liked: dbPost.likes.includes(user) ? true : false