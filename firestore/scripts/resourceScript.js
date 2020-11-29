const db = require("../../db.js");
const resourceJSON = require('../json/resources');

const createResources = async () => {

  for(const resource in resourceJSON) {
    const resourceObject = resourceJSON[resource]
    resourceObject['timestamp'] = Date()
    resourceObject['updatedTimestamp'] = Date()
    await db.collection('resources').add(resourceObject)
        .then(() => {
           console.log('successfully inserted the document');
           return null;
        }).catch(e => {
        console.error('something went wrong', e)
    });
  }

};

createResources();
