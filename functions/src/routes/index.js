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
// TODO:
// 1) Finish Reporting, 2) Add Auth to all routes

// Admin routes (CLEAN)
router.get('/admin/login/:id', response(adminController.adminLogin)); // works
router.get('/admin/posts', checkIfAuthenticated, response(adminController.getPostsByStatus)); // works checkIfAuthenticated
router.put('/admin/moderate', checkIfAuthenticated, response(adminController.moderatePost)); // works
router.post('/admin/prompt', checkIfAuthenticated, response(adminController.createPrompt)); // works checkIfAuthenticated
router.put('/admin/prompt', checkIfAuthenticated, response(adminController.editPrompt)); // done but check
router.get('/admin/topics', response(adminController.getTopics)); // works
router.post('/admin/topic', checkIfAuthenticated, response(adminController.addTopic)); // works checkIfAuthenticated
router.put('/admin/topic', checkIfAuthenticated, response(adminController.editTopic)); // works
router.post('/admin/topics', checkIfAuthenticated, response(adminController.removeTopic)); // works

router.post('/user/topic', response(adminController.addUserTopic)); // works
router.post('/website/email', response(adminController.addEmail)); // works


// User routes (CLEAN)
router.get('/user/username', response(userController.checkUsername)); // works
router.post('/user/create', response(userController.createAccount)); // works
router.put('/user/login', response(userController.login)); // works
router.put('/user/delete', response(userController.deleteAccount)); // works


// Profile routes (CLEAN)
router.get('/profile/view/:id', response(profileController.getProfile)); // works
router.get('/profile/created', response(profileController.getCreated)); // works
router.get('/profile/liked', response(profileController.getLiked)); // works
router.put('/profile/edit', response(profileController.editProfile)); // works


// Content routes (CLEAN)
router.get('/content/liked', response(postController.checkLiked)); // works
router.post('/post/create', response(postController.createPost)); // works
router.post('/response/create', response(postController.createResponse)); // works
router.post('/content/remove', response(postController.removeContent)); // works
router.put('/content/like', response(postController.likeContent)); // works
router.put('/content/share', response(postController.shareContent)); // works
router.put('/post/edit', response(postController.editPost)); // works


// ForYou routes (CLEAN)
router.get('/foryou/posts', response(foryouController.getPosts)); // works
router.get('/foryou/topic', response(foryouController.getPostsByTopic)); // works
router.get('/foryou/prompts', response(foryouController.getPrompts)); // works
router.get('/foryou/responses', response(foryouController.getResponses)); // works
router.get('/foryou/replies', response(foryouController.getReplies)); // works

// Reporting routes (MESSY)
router.post('/report', response(reportController.reportFromApp)); // works
router.put('/admin/reactivate', response(reportController.reactivateUser)); // try
router.get('/reported/:id', response(reportController.getReportedByType)); // tbd
router.get('/reports/all', response(reportController.getReports)); // tbd
router.get('/admin/banned', checkIfAuthenticated, response(reportController.getBannedUsers)); // tbd
router.put('/post/report', checkIfAuthenticated, response(reportController.reportPost)); // done but check
router.put('/response/report', checkIfAuthenticated, response(reportController.reportResponse)); // done but check
router.put('/user/report', checkIfAuthenticated, response(reportController.reportUser)); // done but check


// Resource routes (CLEAN)
router.get('/resources/:id', response(resourceController.getResources)); // works
router.post('/resources/add', response(resourceController.addResources)); // works
router.post('/resources/uni', response(resourceController.suggestUniversity)); // works


module.exports = router;
