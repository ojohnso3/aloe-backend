const db = require('../firebase/db.js');
const middleware = require('../middleware.js');
const processing = require('../processing.js');
const helpers = require('../helpers.js');
const sendgridController = require('./sendgrid_controller.js');

const increment = helpers.FieldValue.increment(1);
const decrement = helpers.FieldValue.increment(-1);

// Check if user has liked post
async function checkLiked(parentData) {
  const parentID = parentData.query.id;
  const userID = parentData.query.userid;
  const type = parentData.query.type; // posts, prompts, responses

  const likedUsers = db.collection(type).doc(parentID).collection('likes');

  const userDoc = await likedUsers.where('userID', '==', userID).get();

  if (userDoc.empty) {
    return false;
  } else {
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

  const ret = {results: middleware.postMiddleware(doc.id, doc.data(), userInfo)}; // removed false for likes

  if (ret) {
    // TODO: comment out when testing locally
    // sendgridController.sendEmail(ret.results.id, ret.results.user, ret.results.timestamp);
  }

  return ret;
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

  // parent of reply
  if (processedResponse.replyID) {
    const parentResponse = db.collection('responses').doc(processedResponse.replyID);
    await parentResponse.update({replies: increment});

    // PUSH notification to owner of original response
    const originalUserID = (await parentResponse.get()).data().userID;
    const originalUser = await db.collection('users').doc(originalUserID).get();
    // console.log('username check REPLY', originalUser.data().username);
    if (originalUser.id !== processedResponse.userID) {
      const promptBody = (await prompt.get()).data().prompt;
      await helpers.sendPushNotification(originalUser.data().token, 'REPLY', processedResponse.userID, processedResponse.anonymous, promptBody);
    }
  }

  const doc = await newResponse.get();
  const userInfo = await helpers.getUserInfo(doc.data().userID, doc.data().anonymous);

  return {results: middleware.responseMiddleware(doc.id, doc.data(), userInfo)}; // removed false for likes
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
  if (!doc.exists) {
    return false;
  }

  const archived = doc.data();
  archived['contentType'] = type;
  await db.collection('archive').doc(id).set(archived);

  // response
  if (type === 'responses') {
    const prompt = db.collection('prompts').doc(archived.parentID);
    await prompt.update({numResponses: decrement});

    const replies = await db.collection('responses').where('replyID', '==', id).get();
    if (!replies.empty) {
      replies.docs.map(async (reply) => {
        await reply.ref.update({replyID: ''});
        // console.log('deleting replyid and turning into normal response');
      });
    } else {
      if (archived.replyID) {
        const parentResponse = db.collection('responses').doc(archived.replyID);
        await parentResponse.update({replies: decrement});
      }
    }
  }

  const likes = await parent.collection('likes').get();
  if (!likes.empty) {
    likes.docs.map(async (likeDoc) => {
      await db.collection('archive').doc(id).collection('likes').add(likeDoc.data());
      await likeDoc.ref.delete();
    });
  }
  await parent.delete();
  return true;
}

// Like content
async function likeContent(parentData) {
  const parentID = parentData.body.id;
  const userID = parentData.body.user;
  const liked = parentData.body.liked;
  const type = parentData.body.type;

  const parent = db.collection(type).doc(parentID);
  const user = db.collection('users').doc(userID);

  // Extra check
  // const docArr = await parent.collection('likes').where('userID', '==', userID).get();
  // if (docArr.size > 0) {
  //   liked = '1';
  // }

  if (liked === '1') {
    console.log('removing like...');
    const docArr = await parent.collection('likes').where('userID', '==', userID).get();
    if (docArr.size < 1) {
      console.log('ERROR: There was no like on content. Gracefully exiting.');
      return false;
    }

    if (docArr.size > 1) {
      console.log('ERROR: Multiple likes existed on content. Will delete all next.');
    }

    // Deleting from content liked subcollection
    docArr.forEach(function(doc) {
      doc.ref.delete();
    });
    await parent.update({numLikes: decrement});

    // Deleting from user profile subcollection
    if (type === 'posts') {
      const userArr = await user.collection('liked').where('parentID', '==', parentID).get();
      if (userArr.size < 1) {
        console.log('ERROR: There was no like on profile. Gracefully exiting.');
        return false;
      }
      if (userArr.size > 1) {
        console.log('ERROR: Multiple likes existed on profile. Will delete all next.');
      }

      userArr.forEach(function(doc) {
        doc.ref.delete();
      });
    } else if (type === 'prompts') {
      const userArr = await user.collection('prompted').where('parentID', '==', parentID).get();
      if (userArr.size < 1) {
        console.log('ERROR: There was no save on profile. Gracefully exiting.');
        return false;
      }
      if (userArr.size > 1) {
        console.log('ERROR: Multiple saves existed on profile. Will delete all next.');
      }

      userArr.forEach(function(doc) {
        doc.ref.delete();
      });
    }
  } else {
    console.log('adding like...');
    const docArr = await parent.collection('likes').where('userID', '==', userID).get();
    if (docArr.size === 0) {
      // Adding to content liked subcollection
      await parent.collection('likes').add({userID: userID, timestamp: helpers.Timestamp.now()});
      await parent.update({numLikes: increment});

      const parentDoc = await parent.get();

      // Adding to user profile subcollection
      if (type === 'posts') {
        await user.collection('liked').add({parentID: parentID, timestamp: helpers.Timestamp.now(), contentTimestamp: parentDoc.data().updatedAt});

        const originalUser = await db.collection('users').doc(parentDoc.data().userID).get();
        if (originalUser.id !== userID) {
          await helpers.sendPushNotification(originalUser.data().token, 'STORYLIKE', userID, false, '');
        }
      } else if (type === 'prompts') {
        await user.collection('prompted').add({parentID: parentID, timestamp: helpers.Timestamp.now(), contentTimestamp: parentDoc.data().updatedAt});
      } else if (type === 'responses') {
        const originalUser = await db.collection('users').doc(parentDoc.data().userID).get();

        if (originalUser.id !== userID) {
          await helpers.sendPushNotification(originalUser.data().token, 'RESPONSELIKE', userID, false, '');
        }
      } else {
        console.log('ERROR: Type is invalid. Gracefully exiting.');
        return false;
      }
    } else {
      console.log('Liked already existed! Gracefully exiting.');
      return false;
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
  await sharedContent.collection('shares').add({userID: userID, timestamp: helpers.Timestamp.now()});
  await sharedContent.update({numShares: increment});
  return true;
}

// Support post
async function supportContent(parentData) {
  const parentID = parentData.body.id;
  const userID = parentData.body.userid;
  const type = parentData.body.type;
  let content = parentData.body.content;

  if (!parentID || !userID || !type) {
    return false;
  }

  if (!content) {
    content = '';
  }

  const supportedContent = db.collection('posts').doc(parentID);
  await supportedContent.collection('supports').add({userID: userID, type: type, content: content, timestamp: helpers.Timestamp.now()});
  await supportedContent.update({numSupports: increment});
  return true;
}

module.exports = {
  checkLiked,
  createPost,
  createResponse,
  editPost,
  removeContent,
  likeContent,
  shareContent,
  supportContent,
};
