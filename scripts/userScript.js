const db = require("../db.js");
const userJSON = require('./json/users');
const previewJSON = require('./json/postPreviews');

const createUsers = async () => {

  for(const user in userJSON) {
    const userObject = userJSON[user]
    await db.collection('users').doc()
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
    var saved = db.collection('users').doc(doc.id).collection('saved');

    previewJSON['created']['timestamp'] = Date()
    previewJSON['saved']['timestamp'] = Date()

    created.doc().set(previewJSON['created']).then(() => {
        console.log('Post Added');
    }).catch(function (error) {
        console.error('Error adding Post: ', error);
    });

    saved.doc().set(previewJSON['saved']).then(() => {
      console.log('Post Added');
    }).catch(function (error) {
      console.error('Error adding Post: ', error);
    });
  });

};

createUsers();
