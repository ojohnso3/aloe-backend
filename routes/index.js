const express = require('express');
const router = express.Router();

const { testingFunctionNameOne, testingFunctionNameTwo }  = require("../controllers/testingController");


/* Home page default */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Express'});
});

function response(handler) {
  return async (req, res, next) => {
    res.send(handler(req, res, next));
  };
}

router.get('/testingEndpointName', response(testingFunctionNameOne));
router.post('/testingEndpointNmae2', response(testingFunctionNameTwo));

module.exports = router;
