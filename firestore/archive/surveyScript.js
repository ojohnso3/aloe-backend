const db = require("../db.js");
const surveyJSON = require('./json/surveys');
const answerJSON = require('./json/answers');

const createSurveys = async () => {

  for(const survey in surveyJSON) {
    const surveyObject = surveyJSON[survey]
    surveyObject['timestamp'] = Date()
    surveyObject['updatedTimestamp'] = Date()
    await db.collection('surveys').doc()
        .set(surveyObject)
        .then(() => {
           console.log('successfully inserted the document');
           return null;
        }).catch(e => {
        console.error('something went wrong', e)
    });
  }

  const surveys = db.collection('surveys');
  const allSurveys = await surveys.orderBy('timestamp').get();

  allSurveys.forEach((doc) => {

    var answers = db.collection('surveys').doc(doc.id).collection('answers');

    for(const answer in answerJSON) {
      const answerObject = answerJSON[answer]
      answers.doc().set(answerObject).then(() => {
          console.log('answer Added');
      }).catch(function (error) {
          console.error('Error adding answer: ', error);
      });
    }
  });

};

createSurveys();
