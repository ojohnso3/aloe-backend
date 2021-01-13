const db = require('../firebase/db.js');
const middleware = require('../middleware.js');
const processing = require('../processing.js');
const helpers = require('../helpers.js');

const FieldValue = require('firebase-admin').firestore.FieldValue;
const increment = FieldValue.increment(1);
const decrement = FieldValue.increment(-1);

// Check if user has liked post
async function checkLikedPost(parentData) {
  const parentID = parentData.query.id;
  const userID = parentData.query.userid;
  const type = parentData.query.type; // posts / comments

  // console.log('check id', parentID)
  // console.log('check user', userID)
  // console.log('check type', type)
  // console.log("FINISH BITCH")

  const item = await db.collection(type).doc(parentID).get();
  // console.log('item data', item.data())

  const likedUsers = db.collection(type).doc(parentID).collection('likes');

  // postUsers.limit(1).get().
  // then(sub => {
  //   if (sub.docs.length > 0) {
  //     console.log('subcollection exists');
  //   } else {
  //     console.log('subcollection is NOT there, so user has not liked');
  //     return false;
  //   }
  // });

  const userDoc = await likedUsers.where('userID', '==', userID).get();

  // console.log('empty', userDoc.empty)

  if (userDoc.empty) {
    console.log('User has not liked.');
    return false;
  } else {
    console.log('User has liked.');
    return true;
  }
}

// Check if user has liked comment
async function checkLikedComment(commentData) {
  const commentID = commentData.body.commentID;
  const userID = commentData.body.userID;
  const commentUsers = db.collection('comments').doc(commentID).collection('likes');
  const userDoc = await commentUsers.where('userID', '==', userID).get();
  if (userDoc.empty) {
    console.log('User has not liked.');
    return false;
  } else {
    console.log('User has liked.');
    return true;
  }
}

// Create new post
async function createPost(postData) {

  const processedPost = processing.postProcessing(postData.body);
  if (!processedPost) {
    return 'There was an error in post creation';
  }
  console.log("PIG 2")

  const newPost = await db.collection('posts').add(processedPost);
  const doc = await newPost.get();

  console.log("PIG 3")

  const userInfo = await helpers.getUserInfo(doc.data().userID);

  console.log("PIG 4")

  return {results: middleware.postMiddleware(doc.id, doc.data(), userInfo)};
}

// Create new comment
async function createComment(commentData) {
  const processedComment = processing.commentProcessing(commentData.body);
  if (!processedComment) {
    return 'There was an error in comment creation';
  }

  const newComment = await db.collection('comments').add(processedComment);

  // console.log('new', newComment)
  const doc = await newComment.get();

  const userInfo = await helpers.getUserInfo(doc.data().userID);

  // console.log('check here', doc.data())

  return {results: middleware.commentMiddleware(doc.id, doc.data(), userInfo)};
}

// Edit post
async function editPost(postData) { // remember dot notation (content.body) for nested fields
  const processedEdits = processing.editProcessing(postData.body);
  if (!processedEdits.post) {
    return 'There was an error in post editing';
  }

  const post = db.collection('posts').doc(processedEdits.id);
  const res = await post.update(processedEdits.post);
  return res;
}

// Delete post
async function remove(parentData) {
  const id = parentData.body.id;
  const type = parentData.body.type;
  const parent = db.collection(type).doc(id);
  const doc = await parent.get();
  const archived = doc.data();
  archived['contentType'] = type;
  const res = await db.collection('archive').add(archived);

  const likes = await parent.collection('likes').get();
  if (!likes.empty) {
    console.log('Deleting likes...');
    likes.forEach(function(doc) {
      doc.ref.delete();
    });
  }
  await parent.delete();
  return res; // TODO return value
}

// Old Delete
// async function removeComment(commentData) {
//   const comment = db.collection('comments').doc(commentData.query.commentID);
//   const res = await comment.update({removed: true});
//   return res; // TODO return value
// }

// Like post
async function likePost(parentData) {
  console.log('parentData', parentData.body);

  const parentID = parentData.body.id;
  const userID = parentData.body.user;
  const liked = parentData.body.liked;
  const timestamp = parentData.body.timestamp;
  const type = parentData.body.type; // posts / comments

  const parent = db.collection(type).doc(parentID);

  // const item = await parent.get();
  // console.log('check item here', item.data())

  let res = null;

  if (liked == '1') {
    const docArr = await parent.collection('likes').where('userID', '==', userID).get();
    if (docArr.size != 1) {
      console.log('ERROR: should like once');
      return null;
    }
    // console.log('size was 1 (thats good)')
    docArr.forEach(function(doc) {
      res = doc.ref.delete();
    });
    await parent.update({numLikes: decrement});
    return res;
  } else {
    res = await parent.collection('likes').add({userID: userID, timestamp: timestamp});
    // console.log('im adding to sublikes', res)
    await parent.update({numLikes: increment});
    return res;
  }
}

// Share post
async function sharePost(postData) {
  console.log('postData.query', postData.query);
  console.log('postData.query', postData.body);
  const postID = postData.body.postid;
  const userID = postData.body.userid;
  const timestamp = postData.body.timestamp;
  const post = db.collection('posts').doc(postID);
  await post.update({numShares: increment});
  return await post.collection('shares').add({userID: userID, timestamp: timestamp});
}


module.exports = {
  checkLikedPost,
  checkLikedComment,
  createPost,
  createComment,
  editPost,
  remove,
  likePost,
  sharePost,
};


// async function getUserInfo(userID) {
//   const userDoc = await db.collection('users').doc(userID).get();
//   var userInfo = {};
//   if (!userDoc.exists) {
//     console.log('No matching user document.'); // return an error here
//   } else {
//     userInfo = {
//       username: userDoc.data().username,
//       profilePic: userDoc.data().profilePic,
//       verified: userDoc.data().verified,
//     }
//   }
//   return userInfo;
// }

// const likes = likesRef.docs.map(doc => doc.data());

// var newLikes = doc.data().likes;
// if (newLikes.includes(user)) {
//   newLikes.splice((newLikes).indexOf(user), 1);
// } else {
//   newLikes.push(user);
// }
// await post.update({likes: newLikes}); // const res = return res
// const updatedPost = await post.get()

// addToSubCollection(user, updatedPost, 'liked') // original post stored

// return middleware.postMiddleware(updatedPost.id, updatedPost.data());
// db.collection('posts').doc(commentData.body.postID).collection('comments').add(commentData.body.comment);
// // const commentDoc = await comment.get()
// // return commentDoc;
// const updatedPost = await db.collection('posts').doc(commentData.body.postID).get();
// return middleware.postMiddleware(updatedPost.id, updatedPost.data());


// OLD

// // also add to users liked subcollection (cloud function?)
// // original version stored (what happens with changes?)
// async function addToSubCollection(user, post, subcollection) {
//   // console.log('sub user', user)
//   // console.log('sub post', post)
//   // console.log('sub collection', subcollection)

//   const fullDoc = await db.collection('users').doc(user).collection(subcollection).doc(post.id)
//   const docDetails = await fullDoc.get()

//   if (docDetails.data()) {
//     console.log('Removing from subcollection');
//     fullDoc.delete();
//   } else{
//     console.log('Adding to subcolleciton');
//     const postData = post.data();
//     postData['id'] = post.id;
//     fullDoc.set(postData);
//   }
// }

// // Like post
// async function likePost(likeData) {
//   const postID = likeData.body.id;
//   const user = likeData.body.user;

//   const post = db.collection('posts').doc(postID);
//   const doc = await post.get();
//   var newLikes = doc.data().likes;
//   if (newLikes.includes(user)) {
//     newLikes.splice((newLikes).indexOf(user), 1);
//   } else {
//     newLikes.push(user);
//   }
//   await post.update({likes: newLikes}); // const res = return res
//   const updatedPost = await post.get()

//   addToSubCollection(user, updatedPost, 'liked') // original post stored

//   return middleware.postMiddleware(updatedPost.id, updatedPost.data());
// }

// // Share post
// async function sharePost(postID) {
//   const post = db.collection('posts').doc(postID.body.id);
//   const doc = await post.get();
//   const res = await post.update({shares: doc.data().shares + 1});
//   return res;
// }

// // - Report post — /post/report (How does this work?)
// async function reportPost(userID, postID) {
//   const post = db.collection('posts').doc(postID.body.id);
//   const res = await post.update({reported: true});
//   return res;
// }

// // - Report comment
// async function reportComment(userID, postID) {
//   const post = db.collection('posts').doc(postID.body.id);
//   const res = await post.update({reported: true});
//   return res;
// }

// // Create new comment (should update comments in post in created/liked)
// async function createComment(commentData) {
//   db.collection('posts').doc(commentData.body.postID).collection('comments').add(commentData.body.comment);
//   // const commentDoc = await comment.get()
//   // return commentDoc;
//   const updatedPost = await db.collection('posts').doc(commentData.body.postID).get();
//   return middleware.postMiddleware(updatedPost.id, updatedPost.data());
// }

// // - Remove comment
// async function removeComment(userID, commentID) {
//   // delete comment
// }

// // if post == draft, just change boolean to false, else:
// // NOTE: be careful of returning sensitive data (private key)

// // Create new post
// async function createPost(postData) {
//   // check if right values are passed in

//   const processedPost = processing.postProcessing(postData.body)

//   const post = await db.collection('posts').add(processedPost);

//   const createdPost = await db.collection('posts').doc(post.id).get()

//   // how are comments updated from sub collection -- figure this out!!
//   addToSubCollection(createdPost.data().username, createdPost, 'created') // original post stored

//   return middleware.postMiddleware(createdPost.id, createdPost.data());
// }

// // Edit post
// async function editPost(postData) { // remember dot notation (content.title) for nested fields
//   const post = db.collection('posts').doc(postData.body.id);
//   const res = await post.update(postData.body);
//   return res;
// }

// // - Delete post — /post/delete
// async function removePost(userID, postID) {
//   const post = db.collection('posts').doc(postID.body.id);
//   // delete
//   return ;
// }


// module.exports = {
//   createPost,
//   createComment,
//   editPost,
//   removePost,
//   removeComment,
//   likePost,
//   sharePost,
// }


// // - Draft post — /post/draft (OPTIONAL)
// async function draftPost(userID, postData) {
//   const post = db.collection('posts').add(postData);
//   // draft field true
//   return post;
// }

// - Save post
// async function savePost(postID) {
//   const post = db.collection('posts').doc(postID.body.id);
//   const doc = await post.get();
//   const res = await post.update({saves: doc.data().saves + 1});
//   // also add to users saved subcollection (cloud function?)
//   return res;
// }
