const db = require("../../db.js");
const answerJSON = require('../json/answers');
const userJSON = require('../json/subUser');

const createAnswers = async () => {

  for(const answer in answerJSON) {
    const answerObject = answerJSON[answer]
    answerObject['timestamp'] = Date()
    await db.collection('answers').add(answerObject)
        .then(() => {
           console.log('successfully inserted the document');
           return null;
        }).catch(e => {
        console.error('something went wrong', e)
    });
  }

  addAnswerSubcollections();

};

async function addAnswerSubcollections() {
  const answers = db.collection('answers');
  const allAnswers = await answers.orderBy('timestamp').get();

  allAnswers.forEach((doc) => {

    var users = db.collection('answers').doc(doc.id).collection('users');

    userJSON['timestamp'] = Date()

    users.add(userJSON).then(() => {
        console.log('Chosen User Added');
    }).catch(function (error) {
        console.error('Error adding sub: ', error);
    });
    
  });
}

createAnswers();
