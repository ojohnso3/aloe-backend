const db = require("../firebase/db.js");
const middleware = require("../middleware.js")
const processing = require("../processing.js")

// Checks if username exists
async function checkUsername(userData) {
  console.log("ahhh", userData.query.username)
  const users = db.collection('users');
  const userDoc = await users.where('username', '==', userData.query.username).get();
  if (userDoc.empty) {
    console.log('Username is available.');
    return true;
  } else {
    console.log('Username is taken.');
    return false;
  }
}

// Create new user account (after auth verification)
async function createAccount(userData) {
  const processedUser = processing.userProcessing(userData.body)
  const newUser = db.collection('users').add(processedUser);
  return newUser; // TODO: return value
}

// Login to account (after auth verification)
async function login(loginData) {
  const email = loginData.body.email;
  const loginTime = loginData.body.loginTime;
  const users = db.collection('users');
  const currUser = await users.where('email', '==', email).get();

  if (currUser.empty) {
    console.log('No such user.');
    return;
  }
  if(currUser.docs.length != 1 ) {
    console.log('ERROR: More than one user with the same email.')
  }

  const userDoc = currUser.docs[0];

  const newDoc = users.doc(userDoc.id)
  await newDoc.update({loginTime: loginTime});

  const updatedUser = await newDoc.get()
  return middleware.userMiddleware(updatedUser.id, updatedUser.data());
}

// Delete Account (soft)
async function deleteAccount(data) {
  const user = db.collection('users').doc(data.body.userID);
  if (user.get().empty) {
    console.log('No such user.');
    return;
  }
  const res = await user.update({ removed: true });
  return res; // TODO: return value
}


module.exports = {
  checkUsername,
  createAccount,
  login,
  deleteAccount
}
