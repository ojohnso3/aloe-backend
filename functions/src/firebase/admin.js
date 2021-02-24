const admin = require('firebase-admin');

// console.log('db check', process.env.PRODUCTION);

// 1) For running locally
const serviceAccount = require(process.env.PRODUCTION ? './production-key.json' : './dev-key.json');

// 2) For deploying for app
// const serviceAccount = require('./production-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
