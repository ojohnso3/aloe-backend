const db = require("../../db.js");
const promptJSON = require('../json/prompts');
const userJSON = require('../json/subUser');
// const responseJSON = require('./json/comments');

const createPrompts = async () => {

  for(const prompt in promptJSON) {
    const promptObject = promptJSON[prompt]
    promptObject['timestamp'] = Date()
    promptObject['updatedTime'] = Date()
    await db.collection('prompts').add(promptObject)
        .then(() => {
           console.log('successfully inserted the document');
           return null;
        }).catch(e => {
        console.error('something went wrong', e)
    });
  }
  
  addPromptSubcollections();
}

async function addPromptSubcollections() {
  const prompts = db.collection('prompts');
  const allPrompts = await prompts.orderBy('timestamp').get();

  allPrompts.forEach((doc) => {

    var likes = db.collection('prompts').doc(doc.id).collection('likes');
    var shares = db.collection('prompts').doc(doc.id).collection('shares');

    userJSON['timestamp'] = Date()

    likes.add(userJSON).then(() => {
        console.log('Likes from User Added');
    }).catch(function (error) {
        console.error('Error adding sub: ', error);
    });
    
    shares.add(userJSON).then(() => {
        console.log('Shares from User Added');
    }).catch(function (error) {
        console.error('Error adding sub: ', error);
    });
  });
}

createPrompts();




//   const prompts = db.collection('prompts');
//   const allPrompts = await prompts.orderBy('timestamp').get();

//   allPrompts.forEach((doc) => {

//     var responses = db.collection('prompts').doc(doc.id).collection('likes');

//     for(const response in responseJSON) {
//       const responseObject = responseJSON[response]
//       responseObject['timestamp'] = Date()
//       responses.doc().set(responseObject).then(() => {
//           console.log('Response Added');
//       }).catch(function (error) {
//           console.error('Error adding response: ', error);
//       });
//     }
//   });

// };