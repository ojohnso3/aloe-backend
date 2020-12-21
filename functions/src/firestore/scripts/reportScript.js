const db = require('../../db.js');
const reportJSON = require('../json/reports');

const createReports = async () => {
  for (const report in reportJSON) {
    const reportObject = reportJSON[report];
    reportObject['timestamp'] = Date();
    await db.collection('reports').add(reportObject)
        .then(() => {
          console.log('successfully inserted the document');
          return null;
        }).catch((e) => {
          console.error('something went wrong', e);
        });
  }
};

createReports();
