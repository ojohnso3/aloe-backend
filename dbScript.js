const db = require("./db.js");
const dbCollection = require('./dbjson');

const addPosts = () => {

  for(const postKey in dbCollection.posts) {
     db.collection('posts').doc()
        .set(dbCollection.posts[postKey])
        .then(() => {
           console.log('successfully inserted the document');
           return null;
        }).catch(e => {
        console.error('something went wrong', e)
     });
  }
};

const addUserPosts = () => {
   for(const postKey in dbCollection.posts) {
      db.collection('users/sidneysux@aloe.co/posts').doc()
         .set(postCollection.posts[postKey])
         .then(() => {
            console.log('successfully inserted the document');
            return null;
         }).catch(e => {
         console.error('something went wrong', e)
      });
   }
 };

const addUsers = () => {

  for(const userKey in dbCollection.users) {
     db.collection('users').doc(dbCollection.users[userKey]['email'])
        .set(dbCollection.users[userKey])
        .then(() => {
           console.log('successfully inserted the document');
           return null;
        }).catch(e => {
        console.error('something went wrong', e)
     });
  }
};

addPosts();
// addUserPosts();
// addUsers();