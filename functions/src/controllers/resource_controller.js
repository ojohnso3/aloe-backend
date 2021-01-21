const db = require('../firebase/db.js');
const middleware = require('../middleware.js');
const csvtojson = require("csvtojson");

// - Get Resources
async function getResources(type) {
  console.log('type', type.params.id)
  const allResources = db.collection('resources');
  const resources = await allResources.where('type', '==', type.params.id).get();
  if (resources.empty) {
    console.log('No matching documents for getResources.');
    return;
  }

  console.log('resources length', resources.docs.length)

  return {results: resources.docs.map((doc) => middleware.resourceMiddleware(doc.id, doc.data()))};
}


async function parseCSV(csvData) {
  var allResources = [];
  for(let i=0; i<csvData.length; i++) {
    let resourceData = csvData[i];

    let name = resourceData[`Name`];
    let type = resourceData[`Type`];
    let contact = resourceData[`Contact`];
    let confidentiality = resourceData[`Confidentiality`];
    let description = resourceData[`Description`];

    const resource = {
      'name': name,
      'type': type,
      'contact': contact,
      'confidentiality': confidentiality,
      'description': description
    }

    allResources.push(resource);
  }
  // console.log('len', allResources.length)
  return allResources;
}

const createResources = async (csvData) => {
  const parsedResources = await parseCSV(csvData);
  parsedResources.map(async (resource) => {
    resource['timestamp'] = Date();
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

// TODO: DELETE CURRENT RESOURCES BEFORE RUNNING
async function addResources() {
  csvtojson()
    .fromFile("./functions/src/resources.csv")
    .then(csvData => {
      createResources(csvData)
    })
}

// addResources()

// MAKING INTO ROUTE (TBD)
// router.post('/airtabletomongo', memberprofilecontroller.airtableToMongo)
// airtableToMongo(req,res,next) {
//   addResources();
// }


module.exports = {
  getResources,
};
