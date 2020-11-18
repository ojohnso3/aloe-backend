const express = require('express');
const router = express.Router();
const db = require("../db.js");

var adminController = require('../controllers/admin_controller.js');
var postController = require('../controllers/post_controller.js');
var userController = require('../controllers/user_controller.js');
var profileController = require('../controllers/profile_controller.js');
var contentController = require('../controllers/content_controller.js');
var reportController = require('../controllers/report_controller.js');

function response(handler) {
  return async (req, res, next) => { 
    handler(req, res, next).then((obj) => {
      res.send(obj)
    })
    .catch(next)
  }
}

// Admin routes
router.get('/admin/posts', response(adminController.getPostsByStatus)); // connected
router.get('/admin/reported/:id', response(adminController.getReportedByType));
router.get('/admin/banned', response(adminController.getBannedUsers));
router.put('/admin/status', response(adminController.moderatePost)); // connected
router.put('/admin/postreport', response(adminController.reportPost));
router.put('/admin/commentreport', response(adminController.reportComment));
router.put('/admin/userreport', response(adminController.reportUser));

// Reporting routes
router.post('/report', response(reportController.report)); 

// Post routes
router.put('/post/like', response(postController.likePost)); // connected
router.put('/post/share', response(postController.sharePost)); // tested
router.post('/post/comment', response(postController.createComment)); // todo
router.post('/post/removec', response(postController.removeComment)); // todo
router.post('/post/create', response(postController.createPost)); // connected
router.put('/post/edit', response(postController.editPost)); // tested
// TODO: Figure out drafting
router.delete('/post/removep', response(postController.removePost));
router.post('/post/draft', response(postController.draftPost)); 

// User routes
router.post('/user/create', response(userController.createAccount)); // figure out user stuff
router.put('/user/login', response(userController.login)); // figure out user stuff
router.put('/user/delete', response(userController.deleteAccount)); // figure out user stuff

// Profile routes
router.get('/profile/:id', response(profileController.getProfile)); // connected
router.put('/profile/update', response(profileController.editProfile)); // tested
router.get('/profile/created', response(profileController.getCreated)); // tbd
router.get('/profile/liked', response(profileController.getLiked)); // tbd

// Content routes
router.get('/content/foryou', response(contentController.getForYouPosts)); // connected
router.get('/content/prompts', response(contentController.getPrompts)); // connected
router.get('/content/surveys', response(contentController.getSurveys)); // connected
router.get('/content/resources/:id', response(contentController.getResources)); // connected



module.exports = router;



// router.put('/post/save', response(postController.savePost)); // tested

// router.get('/admin/post/:id', response(adminController.viewPost));

// old response:
// return async (req, res, next) => {
//   res.send(handler(req, res, next)); // catch
// };

// router.get('/test', response(testingFunction));
// router.post('/newpost', response(addNewPost));
// router.post('/login', response(loginUser));
// router.post('/newuser', response(addNewUser));
// router.put('/updateuser', response(updateUser));

/* Home page default */
// router.get('/', function(req, res, next) {
//   res.render('index', {title: 'Express'});
// });