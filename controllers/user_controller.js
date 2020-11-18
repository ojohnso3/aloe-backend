const db = require("../db.js");
const middleware = require("../middleware.js")

// Create new user account
async function createAccount(userData) {
  // only after verification of email, username, passoword by firebase auth
  const newUser = db.collection('users').add(userData.body);
  return newUser;
}

// Login to account
async function login(loginData) {
  // only after verification of username/passoword by firebase auth
  const username = loginData.body.username;
  const loginTime = loginData.body.timestamp;
  const users = db.collection('users');
  const currUser = await users.where('username', '==', username).get();
  console.log('curr', currUser)
  if (currUser.empty) {
    console.log('No such user.');
    return;
  }
  if(currUser.docs.length != 1 ) {
    console.log('ERROR: More than one user with the same username.')
  }
  const userDoc = currUser.docs[0];

  const newDoc = users.doc(userDoc.id)
  await newDoc.update({loginTime: loginTime});
  const updatedUser = await newDoc.get()
  return middleware.userMiddleware(updatedUser.id, updatedUser.data());

}

// - Delete Account — /users/delete
async function deleteAccount(email) {
  const user = db.collection('users').doc(email);
  if(user.active == false) {
    return
  }
  const res = await user.update({active: false});
  return res;
}


module.exports = {
  createAccount,
  login,
  deleteAccount
}
