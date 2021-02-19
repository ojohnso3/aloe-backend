const admin = require('firebase-admin');

// console.log('db check', process.env.PRODUCTION);
// const serviceAccount = require(process.env.PRODUCTION ? './production-key.json' : './dev-key.json');
const serviceAccount = require('./production-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
