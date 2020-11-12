const db = require("../db.js");
const middleware = require("../middleware.js")

// - Like post
async function likePost(likeData) {
  const post = db.collection('posts').doc(likeData.body.id);
  const doc = await post.get();
  var newLikes = doc.data().likes;
  const user = likeData.body.user;
  if (newLikes.includes(likeData.body.user)) {
    newLikes.splice((newLikes).indexOf(user), 1);
  } else {
    newLikes.push(likeData.body.user);
  }
  await post.update({likes: newLikes}); // const res = return res
  const updatedPost = await post.get()
  return middleware.postMiddleware(updatedPost.id, updatedPost.data());
  // also add to users liked subcollection (cloud function?)
}

// - Save post
async function savePost(postID) {
  const post = db.collection('posts').doc(postID.body.id);
  const doc = await post.get();
  const res = await post.update({saves: doc.data().saves + 1});
  // also add to users saved subcollection (cloud function?)
  return res;
}

// - Share post
async function sharePost(postID) {
  const post = db.collection('posts').doc(postID.body.id);
  const doc = await post.get();
  const res = await post.update({shares: doc.data().shares + 1});
  // trigger share on frontend ?
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

// - Create new post
async function createPost(postData) {
  // if post == draft, just change boolean to false, else:
  const post = db.collection('posts').add(postData.body);
  // also add to users posts subcollection
  return post; // NOTE: be careful of returning sensitive data (private key)
}

// - Edit post
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
  savePost,
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
