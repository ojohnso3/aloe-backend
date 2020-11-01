const admin = require('firebase-admin');

const serviceAccount = require('./aloe-stories-firebase-adminsdk-pu8m0-cfcd2d21a7.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = db;
