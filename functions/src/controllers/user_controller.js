const db = require('../firebase/db.js');
const middleware = require('../middleware.js');
const processing = require('../processing.js');
const helpers = require('../helpers.js');
const admin = require('../firebase/admin');

// Checks if username exists
async function checkUsername(userData) {
  const users = db.collection('users');
  const userDoc = await users.where('username', '==', userData.query.username).get();
  if (userDoc.empty) {
    // console.log('Username is available.');
    return true;
  } else {
    // console.log('Username is taken.');
    return false;
  }
}

// Create new user account (after auth verification)
async function createAccount(userData) {
  return await admin.auth().verifyIdToken(userData.body.token)
  .then(async (decodedToken) => {
    const uid = decodedToken.uid;

    const processedUser = processing.userProcessing(userData.body, uid);
    db.collection('users').add(processedUser);
    return true;
  })
  .catch((error) => {
    console.log('ERROR: ', error)
    return false;
  });
}

// Login to account (after auth verification)
async function login(loginData) {
  const token = loginData.body.token;
  const loginTime = loginData.body.loginTime;

  const timestamp = helpers.dateToTimestamp(loginTime);
  
  return await admin.auth().verifyIdToken(token)
  .then(async (decodedToken) => {
    console.log('decodedToken', decodedToken)

    const uid = decodedToken.uid;

    console.log('uid', uid)

    const users = db.collection('users');
    const currUser = await users.where('uid', '==', uid).where('removed', '==', false).get();

    if (currUser.empty) {
      console.log('No such user.');
      return;
    }
    if (currUser.docs.length !== 1 ) {
      console.log('ERROR: More than one user with the same email.');
    }

    const userDoc = currUser.docs[0];

    const newDoc = users.doc(userDoc.id);
    await newDoc.update({loginTime: timestamp});

    const updatedUser = await newDoc.get();

    return middleware.userMiddleware(updatedUser.id, updatedUser.data());
  })
  .catch((error) => {
    console.log("there is an error")
    console.log('ERROR: ', error)
    return false; // add to admin login???
  });
}


// Login to account (after auth verification)
async function oldlogin(loginData) {
  const email = loginData.body.email;
  const loginTime = loginData.body.loginTime;

  const timestamp = helpers.dateToTimestamp(loginTime);

  const users = db.collection('users');
  const currUser = await users.where('email', '==', email).where('removed', '==', false).get();

  if (currUser.empty) {
    console.log('No such user.');
    return;
  }
  if (currUser.docs.length !== 1 ) {
    console.log('ERROR: More than one user with the same email.');
  }

  const userDoc = currUser.docs[0];

  const newDoc = users.doc(userDoc.id);
  await newDoc.update({loginTime: timestamp});

  const updatedUser = await newDoc.get();

  return middleware.userMiddleware(updatedUser.id, updatedUser.data());
}

// Soft delete user account (hide user and make posts anonymous)
async function deleteAccount(userData) {
  const user = db.collection('users').doc(userData.body.userID);
  const userDoc = await user.get();
  if (!userDoc.exists) {
    console.log('No such user.');
    return;
  }
  await user.update({removed: true});

  const createdPosts = await db.collection('posts').where('userID', '==', userDoc.id).get();
  if (createdPosts.empty) {
    console.log('No created post docs.');
  } else {
    createdPosts.docs.map(async (post) => {
      if (!post.data().anonymous) {
        const postData = db.collection('posts').doc(post.id);
        const postDoc = postData.get();
        if (postDoc.exists) {
          console.log('No such post.');
        } else {
          console.log('changing post' + postDoc.id + 'to anonymous');
          await postData.update({anonymous: true});
        }
      } else {
        console.log('post ' + post.id + 'is already anonymous');
      }
    });
  }
  return true;
}


module.exports = {
  checkUsername,
  createAccount,
  login,
  deleteAccount,
};
