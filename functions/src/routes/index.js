const express = require('express');
const router = express.Router();
const checkIfAuthenticated = require('../firebase/auth');

const adminController = require('../controllers/admin_controller.js');
const postController = require('../controllers/post_controller.js');
const userController = require('../controllers/user_controller.js');
const profileController = require('../controllers/profile_controller.js');
const foryouController = require('../controllers/foryou_controller.js');
const reportController = require('../controllers/report_controller.js');
const resourceController = require('../controllers/resource_controller.js');

function response(handler) {
  return async (req, res, next) => {
    handler(req, res, next).then((obj) => {
      res.send(obj);
    })
        .catch(next);
  };
}

// Admin routes
router.get('/admin/posts', checkIfAuthenticated, response(adminController.getPostsByStatus)); // works
// router.get('/admin/reported/:id', response(adminController.getReportedByType)); //
// router.get('/admin/banned', response(adminController.getBannedUsers));

router.put('/admin/moderate', checkIfAuthenticated, response(adminController.moderatePost)); // done but check
router.put('/admin/postreport', checkIfAuthenticated, response(adminController.reportPost)); // done but check
router.put('/admin/commentreport', checkIfAuthenticated, response(adminController.reportComment)); // done but check
router.put('/admin/userreport', checkIfAuthenticated, response(adminController.reportUser)); // done but check
router.post('/admin/prompt', checkIfAuthenticated, response(adminController.createPrompt)); // done but check
router.post('/website/email', checkIfAuthenticated, response(adminController.addEmail)); // works

// Reporting routes
router.post('/report', response(reportController.reportFromApp)); // works

// Post routes
router.get('/post/liked', response(postController.checkLikedPost)); // works
router.get('/comment/liked', response(postController.checkLikedComment)); // works
router.post('/post/create', response(postController.createPost)); // works
router.post('/comment/create', response(postController.createComment)); // works
router.put('/post/edit', response(postController.editPost)); // works
router.post('/remove', response(postController.remove)); // works
// router.put('/comment/remove', response(postController.removeComment)); // works
router.put('/post/like', response(postController.likePost)); // works
router.put('/post/share', response(postController.sharePost)); // works


// User routes
router.get('/user/username', response(userController.checkUsername)); // works
router.post('/user/create', response(userController.createAccount)); // works
router.put('/user/login', response(userController.login)); // works
router.put('/user/delete', response(userController.deleteAccount)); // works

// Profile routes
router.get('/profile/view/:id', response(profileController.getProfile)); // works
router.get('/profile/created', response(profileController.getCreated)); // works
router.get('/profile/liked', response(profileController.getLiked)); // works
router.put('/profile/edit', response(profileController.editProfile)); // works


// ForYou routes
router.get('/foryou/prompt', response(foryouController.getRecentPrompt)); // works
router.get('/foryou/comments', response(foryouController.getComments)); // works
router.get('/foryou/posts', response(foryouController.getPosts)); // works
router.get('/foryou/prompts', response(foryouController.getPrompts)); // works
router.get('/foryou/chosen', response(foryouController.checkChosenAnswer)); // works
router.get('/foryou/results', response(foryouController.getSurveyResults)); // works
router.post('/foryou/choose', response(foryouController.chooseAnswer)); // works


// Resource routes
router.get('/resources/:id', response(resourceController.getResources)); // works


// TODO: Figure out drafting
// router.delete('/post/removep', response(postController.removePost));
// router.post('/post/draft', response(postController.draftPost));

module.exports = router;


// router.get('/content/surveys', response(foryouController.getSurveys)); // tbd

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