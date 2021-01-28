const express = require('express');
const router = express.Router();
const admin = require('../firebase/admin');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// This is code from firebase
router.post('/sessionLogin', (req, res) => {
  // Get the ID token passed and the CSRF token.
  const idToken = req.body.idToken.toString();
  // const csrfToken = req.body.csrfToken.toString();
  // // Guard against CSRF attacks.
  // if (csrfToken !== req.cookies.csrfToken) {
  //   res.status(401).send('UNAUTHORIZED REQUEST!');
  //   return;
  // }
  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  // Create the session cookie. This will also verify the ID token in the process.
  // The session cookie will have the same claims as the ID token.
  // To only allow session cookie setting on recent sign-in, auth_time in ID token
  // can be checked to ensure user was recently signed in before creating a session cookie.
  admin
      .auth()
      .createSessionCookie(idToken, {expiresIn})
      .then(
          (sessionCookie) => {
            // Set cookie policy for session cookie.
            const options = {maxAge: expiresIn, httpOnly: true, secure: true};
            res.cookie('session', sessionCookie, options);
            res.end(JSON.stringify({status: 'success'}));
          },
          (error) => {
            res.status(401).send('UNAUTHORIZED REQUEST!');
          },
      );
});

module.exports = router;
