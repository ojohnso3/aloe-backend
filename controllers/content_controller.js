const db = require("../db.js");
const middleware = require("../middleware.js");

// - Get Featured posts
async function getFeatured() {
  const posts = db.collection('posts');
  const featured = await posts.where('featured', '==', true).orderBy('timestamp').limit(3).get();
  if (featured.empty) {
    console.log('No matching documents.');
    return;
  }
  
  return {results: featured.map((doc) => middleware.postMiddleware(doc.id, doc.data))};
}

// - Get ForYou posts
async function getForYouPosts() {
  const posts = db.collection('posts');
  const forYou = await posts.where('featured', '==', false).orderBy('timestamp').limit(10).get(); // .startAt(lastPost)
  if (forYou.empty) {
    console.log('No matching documents.');
    return;
  }
  var forYouPosts = []
  forYou.forEach((doc) => {
    forYouPosts.push({id: doc.id, data: doc.data()})
  });
  return forYouPosts
}

// - Get Featured posts — /content/resources
async function getResources(type) {
  const resources = db.collection('resources');
  const selectedResources = await resources.where('type', '==', type).orderBy('timestamp')
    // .startAt(lastPost)
    .limit(3)
    .get();
  // array loop
  return selectedResources;
}


module.exports = {
  getFeatured,
  getForYouPosts,
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