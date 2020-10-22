const express = require('express');
const router = express.Router();
// const db = require("../db.js");
// const { testFunction }  = require("../controllers/testingController");

const admin = require('firebase-admin');
const serviceAccount = require('../aloe-stories-firebase-adminsdk-pu8m0-cfcd2d21a7.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

function response(handler) {
  // return async (req, res, next) => {
  //   res.send(handler(req, res, next)); // catch
  // };
  return async (req, res, next) => { 
    handler(req, res, next).then((obj) => {
      res.send(obj)
    })
    .catch(next)
  }
}

async function testingFunction() {
  const snapshot = await db.collection('users').get();
  snapshot.forEach((doc) => {
    console.log(doc.id, '=>', doc.data());
  });
  return "Testing!";
}

async function addNewUser(userData) {
  const res = await db.collection('users').get(userData.body.username);  
  return res;
}

async function loginUser(userData) {
  const users = db.collection('users');
  const user = await users.where('username', '==', userData.body.email).where('password', '==', userData.body.password).get();
  if (user.empty) {
    console.log('No matching documents.');
    return;
  }  
  return user;
}

async function getSubmittedPosts() {
  const posts = db.collection('posts');
  const submitted = await posts.where('status', '==', 'SUBMITTED').get();
  if (submitted.empty) {
    console.log('No matching documents.');
    return;
  }
  var submittedPosts = []
  submitted.forEach((doc) => {
    console.log(doc.id, '=>', doc.data());
    submittedPosts.push(doc.data())
  });
  return submittedPosts;
}

async function addNewPost() {
  const postData = {
    postID: '002',
    userID: '123456789',
    email: 'sidneysux@aloe.co',
    timestamp: 'October 10, 2020',
    content: '<p>More content.</p>',
    title: 'I want to post.',
    image: 'aloe.jpg',
    status: 'SUBMITTED',
    type: 'Story',
    likes: 'null',
    featured: 'false'
  }
  const newPost = await db.collection('posts').add(postData);
  console.log('p', newPost)
  return newPost;
}

async function updateUser(userData) {
  const userDoc = db.collection('users').doc(userData.body.userID);
  const res = await userDoc.update(userData.body);
  return res;
}

/* Home page default */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Express'});
});

router.get('/test', response(testingFunction));
router.get('/submitted', response(getSubmittedPosts));
router.post('/login', response(loginUser));
router.post('/newpost', response(addNewPost));
// router.post('/newuser', response(addNewUser));
// router.put('/updateuser', response(updateUser));


// router.post('/testingEndpointNmae2', response(testingFunctionNameTwo));
// router.get('/testroute', testingController.myFunction);

module.exports = router;
