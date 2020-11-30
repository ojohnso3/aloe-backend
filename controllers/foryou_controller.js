const db = require("../db.js");
const middleware = require("../middleware.js")
const helpers = require("../helpers.js")

// Get recent prompt
async function getRecentPrompt() {
  const prompts = db.collection('prompts');
  const recent = await prompts.where('numAnswers', '==', 0).limit(1).get(); //.orderBy('timestamp')
  if (recent.empty) {
    console.log('No matching documents.');
    return;
  }
  const doc = recent.docs[0];
  return {results: middleware.promptMiddleware(doc.id, doc.data())};
}

// Get Comments by ID
async function getComments(parentData) {
  const collection = db.collection('comments');
  const comments = await collection.where('parentID', '==', parentData.body.parentID).get();
  if (comments.empty) {
    console.log('No matching document.');
    return;
  }

  const finalComments = [];
  await Promise.all(comments.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(doc.data().userID);
    finalComments.push(middleware.commentMiddleware(doc.id, doc.data(), userInfo))
  }));

  return {results: finalComments}
  // return {results: postComments.docs.map((doc) => middleware.commentMiddleware(doc.id, doc.data(), 'sidthekid'))};
}

// Get ForYou posts
async function getPosts() {
  const posts = db.collection('posts');
  const forYou = await posts.orderBy('timestamp').limit(10).get(); // .startAt(lastPost)
  if (forYou.empty) {
    console.log('No matching documents.');
    return;
  }

  const finalPosts = [];
  await Promise.all(forYou.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(doc.data().userID);
    finalPosts.push(middleware.postMiddleware(doc.id, doc.data(), userInfo))
  }));

  return {results: finalPosts}
}

// Get answers for survey (helper)
async function getSurveyAnswers(promptID) {
  const collection = db.collection('answers');
  const answers = await collection.where('promptID', '==', promptID).get();
  if (answers.empty) {
    console.log('No matching documents.');
    return;
  }

  const surveyAnswers = answers.docs.map((doc) => middleware.answerMiddleware(doc.id, doc.data()));

  return surveyAnswers;
}

// Get prompts for feed
async function getPrompts() {
  const collection = db.collection('prompts');
  const prompts = await collection.orderBy('timestamp').limit(5).get();
  if (prompts.empty) {
    console.log('No matching documents.');
    return;
  }

  const finalPrompts = [];
  await Promise.all(prompts.docs.map(async (doc) => {
    console.log('asurveyn', doc.data().numAnswers)
    const answers = []
    // answers exist
    // if(doc.data().answers.length > 0) {
    //   answers = await getSurveyAnswers(doc.id);
    // }
    finalPrompts.push(middleware.promptMiddleware(doc.id, doc.data(), answers)) // survey middleware
  }));

  return {results: finalPrompts}
}

// Check if user has chosen survey answer
async function checkChosenAnswer(surveyData) {
  const answerID = surveyData.body.answerID;
  const userID = surveyData.body.userID;
  const surveyUsers = db.collection('answers').doc(answerID).collection('users');
  const userDoc = await surveyUsers.where('userID', '==', userID).get();
  if (userDoc.empty) {
    console.log('User has not chosen.');
    return false;
  } else {
    console.log('User has chosen.');
    return true;
  }
}



module.exports = {
  getRecentPrompt,
  getComments,
  getPosts,
  getPrompts,
  checkChosenAnswer,
}






// - Get Prompts
// async function getdPrompts() {
//   const allPrompts = db.collection('prompts');
//   const prompts = await allPrompts.orderBy('timestamp').limit(1).get(); // .startAt(lastPost)
//   if (prompts.empty) {
//     console.log('No matching documents.');
//     return;
//   }
//   return {results: prompts.docs.map((doc) => middleware.promptMiddleware(doc.id, doc.data()))};
// }

// - Get Surveys
// async function getSurveys() {
//   const allSurveys = db.collection('surveys');
//   const surveys = await allSurveys.orderBy('timestamp').get(); // .startAt(lastPost)
//   if (surveys.empty) {
//     console.log('No matching documents.');
//     return;
//   }
//   return {results: surveys.docs.map((doc) => middleware.surveyMiddleware(doc.id, doc.data()))};
// }

// - Get ForYou posts
// async function getPosts() {
//   const posts = db.collection('posts');
//   const forYou = await posts.orderBy('timestamp').limit(10).get(); // .startAt(lastPost)
//   if (forYou.empty) {
//     console.log('No matching documents.');
//     return;
//   }
//   await processPosts(forYou).then((res) => {
//     console.log('win')
//     return res;
//   }).catch(() => {
//     console.log('lose')
//     return;
//   })
// }

  // var postResult = []
  // forYou.docs.map(async (doc) => {
  //   const comments = await getComments(doc);
  //   postResult.push(middleware.postMiddleware(doc.id, doc.data(), comments));
  // });

// async function processPosts(posts) {
//   await posts.docs.map(async (doc) => {
//     await getPostComments(doc).then((comments) => {
//       console.log('there')
//       middleware.postMiddleware(doc.id, doc.data(), comments)
//     }).catch((err) => {
//       console.log('err1', err)
//       return;
//     })
//   }).then((res) => {
//     console.log('yay', res)
//     return {results: res}
//   }).catch((err) => {
//     console.log('err2', err)
//     return;
//   })
// }

// async function getPostComments(doc) {
//   const commentCollection = db.collection('posts').doc(doc.id).collection('comments')
//   const allComments = await commentCollection.orderBy('timestamp').get();
//   if (allComments.empty) {
//     console.log('No matching documents.');
//     return;
//   }
//   var comments = []
//   allComments.docs.map((doc) => {
//     comments.push({id: doc.id, likes: doc.data().likes, body: doc.data().body})
//   });
//   return comments
// }

// For You controller
// - Get featured posts — /featured
// - Load recent posts — /foryou
// - Load more posts — /foryou
// - Load art — /art
// Awareness controller
// - Load recent posts — /awareness
// Resource controller
// - Load all national — /national
// - Load all university — /university
// - Load all brown — /brown


// - Get Featured posts
// async function getFeatured() {
//   const posts = db.collection('posts');
//   const featured = await posts.where('featured', '==', true).orderBy('timestamp').limit(3).get();
//   if (featured.empty) {
//     console.log('No matching documents.');
//     return;
//   }
//   return {results: featured.docs.map((doc) => middleware.postMiddleware(doc.id, doc.data()))};
// }