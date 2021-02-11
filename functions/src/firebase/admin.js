const admin = require('firebase-admin');

const serviceAccount = require(process.env.PRODUCTION ? './production-key.json' : './dev-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
