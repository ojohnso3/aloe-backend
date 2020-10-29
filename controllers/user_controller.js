const db = require("../db.js");


// - Create new account — /users/create
async function createAccount() {
  const post = db.collection('users').doc(postID);
  const res = await post.update({likes: post.likes + 1});
  return res;
}

// - Login to account — /users/login
async function login(email, loginTime) {
  const user = db.collection('users').doc(email);
  const res = await user.update({login_timestamp: loginTime});
  return res;
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
