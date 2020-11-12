const db = require("../db.js");
const userJSON = require('./json/users');
// const previewJSON = require('./json/postPreviews');
const postJSON = require('./json/singlePost');

const createUsers = async () => {

  for(const user in userJSON) {
    const userObject = userJSON[user]
    console.log('user', userObject.username)
    await db.collection('users').doc(userObject.username)
        .set(userObject)
        .then(() => {
           console.log('successfully inserted the document');
           return null;
        }).catch(e => {
        console.error('something went wrong', e)
    });
  }

  const users = db.collection('users');
  const allUsers = await users.get(); // where collection doesn't exist

  allUsers.forEach((doc) => {

    var created = db.collection('users').doc(doc.id).collection('created');
    var liked = db.collection('users').doc(doc.id).collection('liked');

    postJSON['timestamp'] = Date()

    created.doc().set(postJSON).then(() => {
        console.log('Post Added');
    }).catch(function (error) {
        console.error('Error adding Post: ', error);
    });

    liked.doc().set(postJSON).then(() => {
      console.log('Post Added');
    }).catch(function (error) {
      console.error('Error adding Post: ', error);
    });
  });

};

createUsers();
