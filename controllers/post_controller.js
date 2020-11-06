const db = require("../db.js");

// TODO: eventually attach userID to post reactions

// - Like post
async function likePost(postID) {
  const post = db.collection('posts').doc(postID.body.id);
  const doc = await post.get();
  const res = await post.update({likes: doc.data().likes + 1});
  return res;
}

// TODO: add commenting

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
