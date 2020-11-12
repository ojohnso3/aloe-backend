

function postProcessing(postData) {

  console.log('pod', postData)

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
        topics: postData.topics,
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