const db = require("../db.js");

// - Load all posts — /posts
async function getPosts(status) { // add lastPost parameter for pagination
  const posts = db.collection('posts');
  const selected = await posts.where('status', '==', status.query.status).orderBy('timestamp')
    // .startAt(lastPost)
    .limit(10)
    .get();
  if (selected.empty) {
    console.log('No matching documents.');
    return;
  }
  var selectedPosts = []
  selected.forEach((doc) => {
    // console.log(doc.id, '=>', doc.data());
    selectedPosts.push({id: doc.id, data: doc.data()})
  });
  return selectedPosts;
}

// - Change status — /poststatus 
async function updatePostStatus(postData) {
  const post = db.collection('posts').doc(postData.body.id)
  const res = await post.update({status: postData.body.status});
  return res;
}


// TODO: // Figure out how to set up reporting/banning

// - Load reported posts — /reported
async function getReported(limit) {
  const posts = db.collection('posts');
  const selected = await posts.where('reported', '==', true).orderBy('timestamp', 'desc').limit(limit).get();
  if (selected.empty) {
    console.log('No matching documents.');
    return;
  }
  var selectedPosts = []
  selected.forEach((doc) => {
    console.log(doc.id, '=>', doc.data());
    selectedPosts.push(doc.data())
  });
  return selectedPosts;
}

// - Ban user — /banuser
// - Reactivate user — /reactivate
async function updateUserStatus(userID, ban) {
  const user = db.collection('users').doc(userID)
  const res = await user.update({banned: ban});
  return res;
}

module.exports = {
  getPosts,
  getReported,
  updatePostStatus,
  updateUserStatus,
}

// // - view a post — /post
// async function viewPost(postID) {
//   const post = db.collection('posts').doc(postID.params.id)
//   console.log("check sid", post)
//   return post;
// }

// async function addNewUser(userData) {
//   const res = await db.collection('users').get(userData.body.username);  
//   return res;
// }

// async function loginUser(userData) {
//   const users = db.collection('users');
//   const user = await users.where('username', '==', userData.body.email).where('password', '==', userData.body.password).get();
//   if (user.empty) {
//     console.log('No matching documents.');
//     return;
//   }  
//   return user;
// }

// async function addNewPost() {
//   const postData = {
//     postID: '002',
//     userID: '123456789',
//     email: 'sidneysux@aloe.co',
//     timestamp: 'October 10, 2020',
//     content: '<p>More content.</p>',
//     title: 'I want to post.',
//     image: 'aloe.jpg',
//     status: 'SUBMITTED',
//     type: 'Story',
//     likes: 'null',
//     featured: 'false'
//   }
//   const newPost = await db.collection('posts').add(postData);
//   console.log('p', newPost)
//   return newPost;
// }

// async function updateUser(userData) {
//   const userDoc = db.collection('users').doc(userData.body.userID);
//   const res = await userDoc.update(userData.body);
//   return res;
// }

// async function testingFunction() {
//   const snapshot = await db.collection('users').get();
//   snapshot.forEach((doc) => {
//     console.log(doc.id, '=>', doc.data());
//   });
//   return "Testing!";
// }
