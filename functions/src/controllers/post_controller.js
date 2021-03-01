const db = require('../firebase/db.js');
const middleware = require('../middleware.js');
const processing = require('../processing.js');
const helpers = require('../helpers.js');

const increment = helpers.FieldValue.increment(1);
const decrement = helpers.FieldValue.increment(-1);

// Check if user has liked post
async function checkLiked(parentData) {
  // console.log('check like data', parentData.query);
  const parentID = parentData.query.id;
  const userID = parentData.query.userid;
  const type = parentData.query.type; // posts, prompts, responses

  const likedUsers = db.collection(type).doc(parentID).collection('likes');

  const userDoc = await likedUsers.where('userID', '==', userID).get();

  if (userDoc.empty) {
    // console.log('User has not liked.');
    return false;
  } else {
    // console.log('User has liked.');
    return true;
  }
}

// Create new post
async function createPost(postData) {
  const processedPost = processing.postProcessing(postData.body);
  if (!processedPost) {
    return 'There was an error in post creation';
  }

  const newPost = await db.collection('posts').add(processedPost);
  const doc = await newPost.get();

  const userInfo = await helpers.getUserInfo(doc.data().userID, doc.data().anonymous);

  return {results: middleware.postMiddleware(doc.id, doc.data(), userInfo)};
}

// Create new comment
async function createResponse(responseData) {
  const processedResponse = processing.responseProcessing(responseData.body);
  if (!processedResponse) {
    return 'There was an error in response creation';
  }

  const newResponse = await db.collection('responses').add(processedResponse);

  // prompt
  const prompt = db.collection('prompts').doc(processedResponse.parentID);
  await prompt.update({numResponses: increment});

  const doc = await newResponse.get();
  const userInfo = await helpers.getUserInfo(doc.data().userID, doc.data().anonymous);

  return {results: middleware.responseMiddleware(doc.id, doc.data(), userInfo)};
}

// Edit post
async function editPost(postData) {
  const processedEdits = processing.editProcessing(postData.body);

  if (!processedEdits.post) {
    return 'There was an error in post editing';
  }

  const post = db.collection('posts').doc(processedEdits.id);
  await post.update(processedEdits.post);
  return true;
}

// Remove post/response
async function removeContent(parentData) {
  const id = parentData.body.id;
  const type = parentData.body.type; // posts or responses

  const parent = db.collection(type).doc(id);
  const doc = await parent.get();
  const archived = doc.data();
  archived['contentType'] = type;
  await db.collection('archive').doc(id).set(archived);

  // prompt
  if (type === 'responses') {
    const prompt = db.collection('prompts').doc(archived.parentID);
    await prompt.update({numResponses: decrement});
  }

  const likes = await parent.collection('likes').get();
  if (!likes.empty) {
    // console.log('Transferring likes...');
    likes.docs.map(async (likeDoc) => {
      await db.collection('archive').doc(id).collection('likes').add(likeDoc.data());
      await likeDoc.ref.delete();
    });
  }
  await parent.delete();
  return 'success'; // TODO return value
}

// Like content
async function likeContent(parentData) {
  const parentID = parentData.body.id;
  const userID = parentData.body.user;
  let liked = parentData.body.liked;
  const type = parentData.body.type;

  const parent = db.collection(type).doc(parentID);
  const user = db.collection('users').doc(userID);

  // Extra check
  const docArr = await parent.collection('likes').where('userID', '==', userID).get();

  if (docArr.size > 0) {
    liked = '1';
  }

  if (liked === '1') {
    // const docArr = await parent.collection('likes').where('userID', '==', userID).get();
    // if (docArr.size !== 1) {
    //   console.log('ERROR: should like once');
    // }

    docArr.forEach(function(doc) {
      doc.ref.delete();
    });
    await parent.update({numLikes: decrement});

    if (type === 'posts') {
      const userArr = await user.collection('liked').where('parentID', '==', parentID).get();
      if (userArr.size !== 1) {
        console.log('ERROR: should like once');
      }
      userArr.forEach(function(doc) {
        doc.ref.delete();
      });
    }
  } else {
    await parent.collection('likes').add({userID: userID, timestamp: helpers.Timestamp.now()});
    await parent.update({numLikes: increment});

    if (type === 'posts') {
      const parentDoc = await parent.get();
      await user.collection('liked').add({parentID: parentID, timestamp: helpers.Timestamp.now(), contentTimestamp: parentDoc.data().updatedAt});
    }
  }
  return true;
}

// Share post
async function shareContent(parentData) {
  const parentID = parentData.body.id;
  const userID = parentData.body.userid;
  const type = parentData.body.type;

  const sharedContent = db.collection(type).doc(parentID);
  await sharedContent.update({numShares: increment});
  return await sharedContent.collection('shares').add({userID: userID, timestamp: helpers.Timestamp.now()});
}

module.exports = {
  checkLiked,
  createPost,
  createResponse,
  editPost,
  removeContent,
  likeContent,
  shareContent,
};
