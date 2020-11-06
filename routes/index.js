const express = require('express');
const router = express.Router();
const db = require("../db.js");

var adminController = require('../controllers/admin_controller.js');
var postController = require('../controllers/post_controller.js');
var userController = require('../controllers/user_controller.js');
var profileController = require('../controllers/profile_controller.js');
var contentController = require('../controllers/content_controller.js');

function response(handler) {
  return async (req, res, next) => { 
    handler(req, res, next).then((obj) => {
      res.send(obj)
    })
    .catch(next)
  }
}

// Admin routes
router.get('/admin/posts', response(adminController.getPosts)); // tested
router.put('/post/status', response(adminController.updatePostStatus)); // tested
router.get('/admin/reported', response(adminController.getReported)); // figure out reporting
router.put('/user/status', response(adminController.updateUserStatus)); // figure out reporting

// Post routes
router.put('/post/like', response(postController.likePost)); // tested
router.put('/post/save', response(postController.savePost)); // tested
router.put('/post/share', response(postController.sharePost)); // tested
router.put('/post/report', response(postController.reportPost)); // figure out reporting
router.post('/post/create', response(postController.createPost)); // tested
router.put('/post/edit', response(postController.editPost)); // tested
router.delete('/post/delete', response(postController.deletePost)); // figure out drafting
router.post('/post/draft', response(postController.draftPost)); // figure out drafting

// User routes
router.post('/user/create', response(userController.createAccount)); // figure out user stuff
router.put('/user/login', response(userController.login)); // figure out user stuff
router.put('/user/delete', response(userController.deleteAccount)); // figure out user stuff

// Profile routes
router.put('/profile/update', response(profileController.updateProfile)); // tested
router.get('/profile/posts', response(profileController.loadPosts)); // make subcollection
router.get('/profile/saved', response(profileController.loadSaved)); // make subcollection

// Content routes
router.get('/content/featured', response(contentController.getFeatured)); // tested
router.get('/content/foryou', response(contentController.getForYouPosts)); // tested



module.exports = router;



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