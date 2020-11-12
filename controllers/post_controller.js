const db = require("../db.js");
const middleware = require("../middleware.js")


async function addToSubCollection(user, post, subcollection) {
  // also add to users liked subcollection (cloud function?)
  const fullDoc = await db.collection('users').doc(user).collection(subcollection).doc(post.id)
  const docDetails = await fullDoc.get()

  if (docDetails.data()) {
    console.log('Removing from subcollection');
    fullDoc.delete();
  } else{
    console.log('Adding to subcolleciton');
    const postData = post.data();
    postData['id'] = post.id;
    fullDoc.set(postData);
  }
}

// Like post
async function likePost(likeData) {
  const postID = likeData.body.id;
  const user = likeData.body.user;

  const post = db.collection('posts').doc(postID);
  const doc = await post.get();
  var newLikes = doc.data().likes;
  if (newLikes.includes(user)) {
    newLikes.splice((newLikes).indexOf(user), 1);
  } else {
    newLikes.push(user);
  }
  await post.update({likes: newLikes}); // const res = return res
  const updatedPost = await post.get()

  addToSubCollection(user, updatedPost, 'liked')

  return middleware.postMiddleware(updatedPost.id, updatedPost.data());
}

// Share post
async function sharePost(postID) {
  const post = db.collection('posts').doc(postID.body.id);
  const doc = await post.get();
  const res = await post.update({shares: doc.data().shares + 1});
  return res;
}

// - Report post — /post/report (How does this work?)
async function reportPost(userID, postID) {
  const post = db.collection('posts').doc(postID.body.id);
  const res = await post.update({reported: true});
  return res;
}

// - Report comment
async function reportComment(userID, postID) {
  const post = db.collection('posts').doc(postID.body.id);
  const res = await post.update({reported: true});
  return res;
}

// - Create new comment
async function createComment(commentData) {
  const comment = db.collection('posts').doc(commendData.body.id).collection('comments').add(commentData.body);
  return comment;
}

// - Remove comment
async function removeComment(userID, commentID) {
  const comment = db.collection('posts').doc(commendData.body.id).collection('comments').doc(commentID.body.id);
  return comment;
}

// if post == draft, just change boolean to false, else:
// NOTE: be careful of returning sensitive data (private key)

// Create new post
async function createPost(postData) {
  // check if right values are passed in
  
  const post = await db.collection('test').add(postData.body);
  
  const createdPost = await db.collection('test').doc(post.id).get();

  addToSubCollection(createdPost.data().user, createdPost, 'created')

  return createdPost;
}

// Edit post
async function editPost(postData) { // remember dot notation (content.title) for nested fields
  const post = db.collection('posts').doc(postData.body.id);
  const res = await post.update(postData.body);
  return res;
}

// - Delete post — /post/delete
async function removePost(userID, postID) {
  const post = db.collection('posts').doc(postID.body.id);
  // delete
  return ;
}

// - Draft post — /post/draft (OPTIONAL)
async function draftPost(userID, postData) {
  const post = db.collection('posts').add(postData);
  // draft field true
  return post;
}



module.exports = {
  likePost,
  sharePost,
  reportPost,
  reportComment,
  createComment,
  removeComment,
  createPost,
  editPost,
  removePost,
  draftPost
}


// - Save post
// async function savePost(postID) {
//   const post = db.collection('posts').doc(postID.body.id);
//   const doc = await post.get();
//   const res = await post.update({saves: doc.data().saves + 1});
//   // also add to users saved subcollection (cloud function?)
//   return res;
// }