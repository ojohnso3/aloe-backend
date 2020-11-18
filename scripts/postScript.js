const db = require("../db.js");
const postJSON = require('./json/posts');
const commentJSON = require('./json/comments');
const reportJSON = require('./json/reports');

const createPosts = async () => {

  for(const post in postJSON) {
    const postObject = postJSON[post]
    postObject['timestamp'] = Date()
    postObject['updatedTimestamp'] = Date()
    await db.collection('posts').doc()
        .set(postObject)
        .then(() => {
           console.log('successfully inserted the document');
           return null;
        }).catch(e => {
        console.error('something went wrong', e)
    });
  }

  addPostSubcollections();

};

function addPostSubcollections() {
  const posts = db.collection('posts');
  const allPosts = await posts.orderBy('timestamp').get(); // where collection doesn't exist

  allPosts.forEach((doc) => {

    var comments = db.collection('posts').doc(doc.id).collection('comments');
    var reports = db.collection('users').doc(doc.id).collection('reports');

    for(const comment in commentJSON) { // report subcollection :0
      const commentObject = commentJSON[comment]
      commentObject['timestamp'] = Date()
      comments.doc().set(commentObject).then(() => {
          console.log('Comment Added');
      }).catch(function (error) {
          console.error('Error adding comment: ', error);
      });
    }

    reports.doc().set(reportJSON).then(() => {
      console.log('Report Added');
    }).catch(function (error) {
      console.error('Error adding Report: ', error);
    });
  });
}

createPosts();
