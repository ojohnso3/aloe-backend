const db = require('../../firebase/db.js');
const userJSON = require('../json/users');
const postJSON = require('../json/subPost');
// const reportJSON = require('./json/reports');

const createUsers = async () => {
  for (const user in userJSON) {
    const userObject = userJSON[user];
    userObject['signupTime'] = Date();
    userObject['loginTime'] = Date();
    await db.collection('users').add(userObject)
        .then(() => {
          console.log('successfully inserted user document');
          return null;
        }).catch((e) => {
          console.error('something went wrong', e);
        });
  }

  // addUserSubcollections();
};

async function addUserSubcollections() {
  const users = db.collection('users');
  const allUsers = await users.get();

  allUsers.forEach((doc) => {
    const liked = db.collection('users').doc(doc.id).collection('liked');
    // var created = db.collection('users').doc(doc.id).collection('created');
    // var reports = db.collection('users').doc(doc.id).collection('reports');

    postJSON['timestamp'] = Date();

    liked.add(postJSON).then(() => {
      console.log('Liked Post Added');
    }).catch(function(error) {
      console.error('Error adding Post: ', error);
    });

    // created.add(postJSON).then(() => {
    //     console.log('Created Post Added');
    // }).catch(function (error) {
    //     console.error('Error adding Post: ', error);
    // });
    // reports.add(reportJSON).then(() => {
    //   console.log('Report Added');
    // }).catch(function (error) {
    //   console.error('Error adding Report: ', error);
    // });
  });
}

// Runs script
createUsers();
