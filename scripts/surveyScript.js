const db = require("../db.js");
const surveyJSON = require('./json/surveys');
const optionJSON = require('./json/options');

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

    var options = db.collection('surveys').doc(doc.id).collection('options');

    for(const option in optionJSON) {
      const optionObject = optionJSON[option]
      options.doc().set(optionObject).then(() => {
          console.log('Option Added');
      }).catch(function (error) {
          console.error('Error adding option: ', error);
      });
    }
  });

};

createSurveys();
