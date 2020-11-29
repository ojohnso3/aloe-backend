const db = require("../../db.js");
const commentJSON = require('../json/comments');
const userJSON = require('../json/subUser');

const createComments = async () => {

  for(const comment in commentJSON) {
    const commentObject = commentJSON[comment]
    commentObject['timestamp'] = Date()
    await db.collection('comments').add(commentObject)
        .then(() => {
           console.log('successfully inserted the document');
           return null;
        }).catch(e => {
        console.error('something went wrong', e)
    });
  }

  addCommentSubcollections();

};

async function addCommentSubcollections() {
  const comments = db.collection('comments');
  const allComments = await comments.orderBy('timestamp').get();

  allComments.forEach((doc) => {

    var likes = db.collection('comments').doc(doc.id).collection('likes');

    userJSON['timestamp'] = Date()

    likes.add(userJSON).then(() => {
        console.log('Likes from User Added');
    }).catch(function (error) {
        console.error('Error adding sub: ', error);
    });
    
  });
}

createComments();
