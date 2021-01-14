const db = require('../firebase/db.js');
const middleware = require('../middleware.js');
const helpers = require('../helpers.js');

// Get recent prompt
async function getRecentPrompt() {
  const prompts = db.collection('prompts');
  const recent = await prompts.where('numAnswers', '==', 0).limit(1).get(); // .orderBy('timestamp')
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
  const comments = await collection.where('parentID', '==', parentData.query.id).get();
  if (comments.empty) {
    console.log('No matching document for comment.');
    return {results: []};
  }

  const finalComments = [];
  await Promise.all(comments.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(doc.data().userID);
    finalComments.push(middleware.commentMiddleware(doc.id, doc.data(), userInfo));
  }));

  return {results: finalComments};
}

// return {results: postComments.docs.map((doc) => middleware.commentMiddleware(doc.id, doc.data(), 'sidthekid'))};


// Get ForYou posts
async function getPosts(post) {
  const posts = db.collection('posts');
  let forYou = [];
  if (post.query.timestamp) {
    forYou = await posts.where('status', '==', 'APPROVED').orderBy('timestamp', 'desc').startAfter(post.query.timestamp).limit(5).get();
  } else {
    forYou = await posts.where('status', '==', 'APPROVED').orderBy('timestamp', 'desc').limit(5).get();
  }
  if (forYou.empty) {
    console.log('No matching documents.');
    return {results: []};
  }

  const finalPosts = [];
  await Promise.all(forYou.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(doc.data().userID);
    finalPosts.push(middleware.postMiddleware(doc.id, doc.data(), userInfo));
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
async function getPrompts(prompt) {
  const collection = db.collection('prompts');
  let prompts = [];
  if (prompt.query.timestamp) {
    prompts = await collection.orderBy('timestamp', 'desc').startAfter(prompt.query.timestamp).limit(3).get(); // 2
  } else {
    prompts = await collection.orderBy('timestamp', 'desc').limit(3).get(); // 2
  }
  if (prompts.empty) {
    console.log('No matching documents.');
    return;
  }

  const finalPrompts = [];
  await Promise.all(prompts.docs.map(async (doc) => {
    let answers = [];
    if (doc.data().numAnswers) {
      // console.log('docid', doc.id)
      answers = await getSurveyAnswers(doc.id);
      // console.log('answers here', answers)
    }
    const topComment = await getTopComment(doc.id);

    finalPrompts.push(middleware.promptMiddleware(doc.id, doc.data(), topComment, answers)); // survey middleware
  }));

  // console.log('final', finalPrompts)

  return {results: finalPrompts};
}

// Get posts by topic
async function getTopComment(promptID) {
  console.log('promptID', promptID)
  const comments = db.collection('comments');
  const top = await comments.where('parentID', '==', promptID).orderBy('numLikes', 'desc').limit(1).get();
  
  if (top.empty) {
    console.log('No matching documents.');
    return '';
  }

  const topComment = top.docs[0];

  return topComment.data().body;
}

// Check if user has chosen survey answer
async function checkChosenAnswer(surveyData) {
  const answerID = surveyData.query.answerid;
  const userID = surveyData.query.userid;
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

// Check if user has chosen survey answer
async function chooseAnswer(surveyData) {
  console.log('sd', surveyData.body);
  const answerID = surveyData.body.answerid;
  const userID = surveyData.body.userid;
  const timestamp = surveyData.body.timestamp;
  const answerUser = {
    userID: userID,
    timestamp: timestamp,
  };
  return await db.collection('answers').doc(answerID).collection('users').add(answerUser);
}

// Check if user has chosen survey answer
async function getSurveyResults(answerData) {
  console.log('sd', answerData.query);
  const answerID = answerData.query.answerid;

  const answer = db.collection('answers').doc(answerID);
  const answerDoc = await answer.get();
  if (!answerDoc.exists) {
    console.log('error');
    return '-1';
  }

  const answerUsers = await answer.collection('users').get();
  console.log('size', answerUsers.size);
  return answerUsers.size.toString();
}
// async function getSurveyResults(promptData) {
//   console.log('sd', promptData.body)
//   const promptID = promptData.body.promptid;
//   const answerID = promptData.body.answerid;

//   const allAnswers = await db.collection('answers').where("promptID", "==", promptID).get();
//   if(allAnswers.empty) {
//     console.log("error")
//     return {results: []}
//   }

//   const answerResults = [];
//   var allUsers = 0;
//   await Promise.all(allAnswers.docs.map(async (doc) => {
//     const answerUsers = await db.collection('answers').doc(doc.id).collection('users').get();
//     allUsers += answerUsers.size;
//     console.log("all", allUsers)
//     const answerCount = {
//       id: doc.id,
//       count: answerUsers.size,
//       percentage: null,
//     }
//     answerResults.push(answerCount)
//   }));
//   answerResults.map((answer) => {
//     answer.percentage = (answer.count / allUsers) * 100;
//     console.log(".percentage", answer.percentage)
//   })
//   return;
// }

// Get posts by topic
async function getPostsByTopic(post) { // (APPROVED)
  console.log('topic', post.query)
  const posts = db.collection('posts');
  let forYou = [];
  if (post.query.timestamp) {
    forYou = await posts.where('content.topics', 'array-contains', post.query.topic).orderBy('timestamp', 'desc').startAfter(post.query.timestamp).limit(5).get();
  } else {
    forYou = await posts.where('content.topics', 'array-contains', post.query.topic).orderBy('timestamp', 'desc').limit(5).get()
  }
  if (forYou.empty) {
    console.log('No matching documents.');
    return {results: []};
  }

  const finalPosts = [];
  await Promise.all(forYou.docs.map(async (doc) => {
    const userInfo = await helpers.getUserInfo(doc.data().userID);
    finalPosts.push(middleware.postMiddleware(doc.id, doc.data(), userInfo));
  }));

  return {results: finalPosts}
}


module.exports = {
  getRecentPrompt,
  getComments,
  getPosts,
  getPrompts,
  checkChosenAnswer,
  chooseAnswer,
  getSurveyResults,
  getPostsByTopic,
};


// async function getFeed(post, prompt) {
//   const posts = await getPosts(post)
//   const prompts = await getPrompts(prompt)

//   const numPosts = posts.results.length
//   console.log('num', numPosts)

//   var finalFeed = []

//   finalFeed.push(posts.results.slice(0, numPosts/2))
//   if(prompts.results.length > 0) {
//     finalFeed.push(prompts.results[1])
//   }
//   finalFeed.push(posts.results.slice(numPosts/2, numPosts))
//   if(prompts.results.length > 1) { // == 2
//     finalFeed.push(prompts.results[1])
//   }

//   console.log('fin', finalFeed)

//   return {results: finalFeed}
// }


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
