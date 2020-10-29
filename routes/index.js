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
    // console.log('handler', req)
    handler(req, res, next).then((obj) => {
      res.send(obj)
    })
    .catch(next)
  }
}

/* Home page default */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Express'});
});

// Admin routes
router.get('/admin/posts', response(adminController.getPosts));
router.get('/admin/post/:id', response(adminController.viewPost));
router.get('/admin/reported', response(adminController.getReported));
router.put('/post/status', response(adminController.updatePostStatus));
router.put('/user/status', response(adminController.updateUserStatus));

// Post routes
router.put('/post/like', response(postController.likePost));
router.put('/post/save', response(postController.savePost));
router.put('/post/share', response(postController.sharePost));
router.put('/post/report', response(postController.reportPost));
router.post('/post/create', response(postController.createPost));
router.put('/post/edit', response(postController.editPost));
router.delete('/post/delete', response(postController.deletePost));
router.post('/post/draft', response(postController.draftPost));

// User routes
router.post('/user/create', response(userController.createAccount));
router.put('/user/login', response(userController.login));
router.put('/user/delete', response(userController.deleteAccount));

// Profile routes
router.put('/profile/update', response(profileController.updateProfile));
router.put('/profile/posts', response(profileController.loadPosts));
router.put('/profile/saved', response(profileController.loadSaved));


module.exports = router;


// old response:
// return async (req, res, next) => {
//   res.send(handler(req, res, next)); // catch
// };

// router.get('/test', response(testingFunction));
// router.post('/newpost', response(addNewPost));
// router.post('/login', response(loginUser));
// router.post('/newuser', response(addNewUser));
// router.put('/updateuser', response(updateUser));
