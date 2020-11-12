

function postProcessing(post) {

  console.log('pod', post)
  const postData = JSON.parse(JSON.stringify(post)); 
  console.log('pod2', postData)
  // req.body = [Object: null prototype] { title: 'product' }

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