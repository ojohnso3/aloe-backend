const db = require("../db.js");
const userJSON = require('./json/users');
// const previewJSON = require('./json/postPreviews');
const postJSON = require('./json/singlePost');
const reportJSON = require('./json/reports');

const createUsers = async () => {

  for(const user in userJSON) {
    const userObject = userJSON[user]
    await db.collection('users').add(userObject)
        .then(() => {
           console.log('successfully inserted user document');
           return null;
        }).catch(e => {
        console.error('something went wrong', e)
    });
  }

  addUserSubcollections();

};

function addUserSubcollections() {
  const users = db.collection('users');
  const allUsers = await users.get();

  allUsers.forEach((doc) => {

    var created = db.collection('users').doc(doc.id).collection('created');
    var liked = db.collection('users').doc(doc.id).collection('liked');
    var reports = db.collection('users').doc(doc.id).collection('reports');

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

    reports.doc().set(reportJSON).then(() => {
      console.log('Report Added');
    }).catch(function (error) {
      console.error('Error adding Report: ', error);
    });

  });
}

// Runs script
createUsers();
