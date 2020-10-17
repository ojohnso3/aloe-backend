const express = require('express');
const router = express.Router();

const admin = require('firebase-admin');

const serviceAccount = require('../../aloe-stories-firebase-adminsdk-pu8m0-3f8b880ef5.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Express'});
});

router.get('/testing-users', async function(req, res, next) {
  const snapshot = await db.collection('users').get();
  snapshot.forEach((doc) => {
    console.log(doc.id, '=>', doc.data());
  });

  res.send('This is a test');
});


module.exports = router;
