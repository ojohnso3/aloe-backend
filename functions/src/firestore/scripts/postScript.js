const db = require('../../db.js');
const postJSON = require('../json/posts');
const userJSON = require('../json/subUser');
// const commentJSON = require('../json/subComment');
// const reportJSON = require('../json/reports');

const createPosts = async () => {
  for (const post in postJSON) {
    const postObject = postJSON[post];
    postObject['timestamp'] = Date();
    postObject['updatedTime'] = Date();
    await db.collection('posts').add(postObject)
        .then(() => {
          console.log('successfully inserted the document');
          return null;
        }).catch((e) => {
          console.error('something went wrong', e);
        });
  }

  addPostSubcollections();
};

async function addPostSubcollections() {
  const posts = db.collection('posts');
  const allPosts = await posts.orderBy('timestamp').get();

  allPosts.forEach((doc) => {
    const likes = db.collection('posts').doc(doc.id).collection('likes');
    const shares = db.collection('posts').doc(doc.id).collection('shares');
    // var comments = db.collection('posts').doc(doc.id).collection('comments');
    // var reports = db.collection('users').doc(doc.id).collection('reports');
    // commentJSON['timestamp'] = Date()

    userJSON['timestamp'] = Date();

    likes.add(userJSON).then(() => {
      console.log('Likes from User Added');
    }).catch(function(error) {
      console.error('Error adding sub: ', error);
    });

    shares.add(userJSON).then(() => {
      console.log('Shares from User Added');
    }).catch(function(error) {
      console.error('Error adding sub: ', error);
    });

    // comments.add(commentJSON).then(() => {
    //     console.log('Comments Added');
    // }).catch(function (error) {
    //     console.error('Error adding sub: ', error);
    // });

    // for(const comment in commentJSON) { // report subcollection :0
    //   const commentObject = commentJSON[comment]
    //   commentObject['timestamp'] = Date()
    //   comments.doc().set(commentObject).then(() => {
    //       console.log('Comment Added');
    //   }).catch(function (error) {
    //       console.error('Error adding sub: ', error);
    //   });
    // }

    // reports.doc().set(reportJSON).then(() => {
    //   console.log('Report Added');
    // }).catch(function (error) {
    //   console.error('Error adding Report: ', error);
    // });
  });
}

createPosts();
