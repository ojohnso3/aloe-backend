const db = require("../db.js");

// - Like post — /post/like
async function likePost(userID, postID) {
  const post = db.collection('posts').doc(postID);
  const res = await post.update({likes: post.likes + 1});
  return res;
}

// - Save post — /post/save
async function savePost(userID, postID) {
  const post = db.collection('posts').doc(postID);
  const res = await post.update({saves: post.saves + 1});
  // also add to users saved subcollection
  return res;
}

// - Share post — /post/share
async function sharePost(userID, postID) {
  const post = db.collection('posts').doc(postID);
  const res = await post.update({shares: post.shares + 1});
  // trigger share on frontend ?
  return res;
}

// - Report post — /post/report (How does this work?)
async function reportPost(userID, postID) {
  const post = db.collection('posts').doc(postID);
  const res = await post.update({reported: true});
  return res;
}

// - Create new post — /post/create
async function createPost(postData) {
  // if post == draft, just change boolean to false, else:
  const post = db.collection('posts').add(postData);
  // also add to users posts subcollection
  return post;
}

// - Edit post — /post/edit
async function editPost(postData) {
  const posts = db.collection('posts').doc(postID);
  const res = await post.update(postData);
  return res;
}

// - Delete post — /post/delete
async function deletePost(userID, postID) {
  const post = db.collection('posts').doc(postID);
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
  createPost,
  editPost,
  deletePost,
  draftPost
}
