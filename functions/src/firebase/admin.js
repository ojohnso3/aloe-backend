const admin = require('firebase-admin');


// TODO: comment out when deploying
// 1) For running locally
// const serviceAccount = require(process.env.PRODUCTION ? './production-key.json' : './dev-key.json');
// process.env.PRODUCTION ? console.log('YOU ARE ON PRODUCTION') : console.log('YOU ARE ON TESTING');

// TODO: comment out when testing locally
// 2) For deploying for app
const serviceAccount = require('./production-key.json');
console.log('YOU ARE ON PRODUCTION');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
