const db = require("../db.js");
const promptJSON = require('./json/prompts');
const responseJSON = require('./json/comments');

const createPrompts = async () => {

  for(const prompt in promptJSON) {
    const promptObject = promptJSON[prompt]
    promptObject['timestamp'] = Date()
    promptObject['updatedTimestamp'] = Date()
    await db.collection('prompts').doc()
        .set(promptObject)
        .then(() => {
           console.log('successfully inserted the document');
           return null;
        }).catch(e => {
        console.error('something went wrong', e)
    });
  }

  const prompts = db.collection('prompts');
  const allPrompts = await prompts.orderBy('timestamp').get();

  allPrompts.forEach((doc) => {

    var responses = db.collection('prompts').doc(doc.id).collection('responses');

    for(const response in responseJSON) {
      const responseObject = responseJSON[response]
      responseObject['timestamp'] = Date()
      responses.doc().set(responseObject).then(() => {
          console.log('Response Added');
      }).catch(function (error) {
          console.error('Error adding response: ', error);
      });
    }
  });

};

createPrompts();
