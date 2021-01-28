const db = require('../firebase/db.js');
const middleware = require('../middleware.js');
const csvtojson = require('csvtojson');
const Timestamp = require('firebase-admin').firestore.Timestamp;


// - Get Resources
async function getResources(type) {
  const allResources = db.collection('resources');
  const resources = await allResources.where('type', '==', type.params.id).get();
  if (resources.empty) {
    console.log('No matching documents for getResources.');
    return;
  }
  // console.log('resources length', resources.docs.length)

  return {results: resources.docs.map((doc) => middleware.resourceMiddleware(doc.id, doc.data()))};
}


async function parseCSV(csvData) {
  const allResources = [];
  for (let i=0; i<csvData.length; i++) {
    const resourceData = csvData[i];

    const name = resourceData[`Name`];
    const type = resourceData[`Type`];
    const contact = resourceData[`Contact`];
    const confidentiality = resourceData[`Confidentiality`];
    const description = resourceData[`Description`];

    const resource = {
      'name': name,
      'type': type,
      'contact': contact,
      'confidentiality': confidentiality,
      'description': description,
    };

    allResources.push(resource);
  }
  console.log('resources #: ', allResources.length);
  return allResources;
}

const createResources = async (csvData) => {
  const parsedResources = await parseCSV(csvData);
  parsedResources.map(async (resource) => {
    resource['createdAt'] = Timestamp.now();
    resource['updatedAt'] = Timestamp.now();
    // console.log("final resource", resource);
    await db.collection('resources').add(resource)
        .then(() => {
          console.log('successfully added the resource');
          return null;
        }).catch((e) => {
          console.error('something went wrong', e);
        });
  });
};

async function addResources() {
  csvtojson()
      .fromFile('./functions/src/resources.csv')
      .then((csvData) => {
        createResources(csvData);
      });
}

module.exports = {
  getResources,
  addResources,
};
