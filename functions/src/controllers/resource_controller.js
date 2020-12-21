const db = require('../firebase/db.js');
const middleware = require('../middleware.js');
const helpers = require('../helpers.js');

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


module.exports = {
  getResources,
};
