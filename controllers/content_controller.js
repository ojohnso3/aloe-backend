const db = require("../db.js");
const middleware = require("../middleware.js")

// - Get ForYou posts
async function getForYouPosts() {
  const posts = db.collection('posts');
  const forYou = await posts.orderBy('timestamp').limit(10).get(); // .startAt(lastPost)
  if (forYou.empty) {
    console.log('No matching documents.');
    return;
  }
  return {results: forYou.docs.map((doc) => middleware.postMiddleware(doc.id, doc.data()))};
}

// - Get Prompts
async function getPrompts() {
  const allPrompts = db.collection('prompts');
  const prompts = await allPrompts.orderBy('timestamp').limit(1).get(); // .startAt(lastPost)
  if (prompts.empty) {
    console.log('No matching documents.');
    return;
  }
  return {results: prompts.docs.map((doc) => middleware.promptMiddleware(doc.id, doc.data()))};
}

// - Get Surveys
async function getSurveys() {
  const allSurveys = db.collection('surveys');
  const surveys = await allSurveys.orderBy('timestamp').get(); // .startAt(lastPost)
  if (surveys.empty) {
    console.log('No matching documents.');
    return;
  }
  return {results: surveys.docs.map((doc) => middleware.surveyMiddleware(doc.id, doc.data()))};
}

// - Get ForYou posts
async function getPosts() {
  const posts = db.collection('posts');
  const forYou = await posts.orderBy('timestamp').limit(10).get(); // .startAt(lastPost)
  if (forYou.empty) {
    console.log('No matching documents.');
    return;
  }
  await processPosts(forYou).then((res) => {
    console.log('win')
    return res;
  }).catch(() => {
    console.log('lose')
    return;
  })
}

  // var postResult = []
  // forYou.docs.map(async (doc) => {
  //   const comments = await getComments(doc);
  //   postResult.push(middleware.postMiddleware(doc.id, doc.data(), comments));
  // });

async function processPosts(posts) {
  await posts.docs.map(async (doc) => {
    await getComments(doc).then((comments) => {
      console.log('there')
      middleware.postMiddleware(doc.id, doc.data(), comments)
    }).catch((err) => {
      console.log('err1', err)
      return;
    })
  }).then((res) => {
    console.log('yay', res)
    return {results: res}
  }).catch((err) => {
    console.log('err2', err)
    return;
  })
}

async function getComments(doc) {
  const commentCollection = db.collection('posts').doc(doc.id).collection('comments')
  const allComments = await commentCollection.orderBy('timestamp').get();
  if (allComments.empty) {
    console.log('No matching documents.');
    return;
  }
  var comments = []
  allComments.docs.map((doc) => {
    comments.push({id: doc.id, likes: doc.data().likes, body: doc.data().body})
  });
  return comments
}

// - Get Resources
async function getResources(type) {
  const allResources = db.collection('resources');
  const resources = await allResources.where('type', '==', type.params.id).get();
  if (resources.empty) {
    console.log('No matching documents.');
    return;
  }
  return {results: resources.docs.map((doc) => middleware.resourceMiddleware(doc.id, doc.data()))};
}


module.exports = {
  getForYouPosts,
  getPrompts,
  getSurveys,
  getResources
}


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