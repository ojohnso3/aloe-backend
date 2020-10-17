const admin = require('firebase-admin');

const serviceAccount = require('../aloe-stories-firebase-adminsdk-pu8m0-3f8b880ef5.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();