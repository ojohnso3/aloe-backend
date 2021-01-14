const db = require('../firebase/db.js');
const middleware = require('../middleware.js');
// const helpers = require('../helpers.js');
const csvtojson = require("csvtojson");

// - Get Resources
async function getResources(type) {
  const allResources = db.collection('resources');
  const resources = await allResources.where('type', '==', type.params.id).get();
  if (resources.empty) {
    console.log('No matching documents.');
    return;
  }
  return {results: resources.docs.map((doc) => middleware.resourceMiddleware(doc.id, doc.data()))};
}

async function parseCSV(csvData) {
  for(let i=0; i<csvData.length; i++) {
    let memberProfile = csvData[i]
    let name;
  }
}

async function addResources() {
  csvtojson()
    .fromFile("Member-Typeform-Grid view.csv")
    .then(csvData => {
      createProfile(csvData)
    })
}




module.exports = {
  getResources,
};
