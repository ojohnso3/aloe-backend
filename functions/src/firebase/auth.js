const admin = require('./admin.js');

const getAuthToken = (req, res, next) => {
  if (
    req.headers.authorization
  ) {
    req.authToken = req.headers.authorization;
  } else {
    req.authToken = null;
  }
  next();
};


const checkIfAuthenticated = (req, res, next) => {
  getAuthToken(req, res, async () => {
    try {
      const {authToken} = req;
      const userInfo = await admin
          .auth()
          .verifyIdToken(authToken);
      req.authId = userInfo.uid;
      return next();
    } catch (e) {
      return res
          .status(401)
          .send({error: 'You are not authorized to make this request'});
    }
  });
};

module.exports = checkIfAuthenticated;
