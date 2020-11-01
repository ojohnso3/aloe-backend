const db = require("../db.js");

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

// - Get Featured posts — /content/featured
async function getFeatured() {
  const posts = db.collection('posts');
  const featured = await posts.where('featured', '==', true).orderBy('timestamp')
    // .startAt(lastPost)
    .limit(3)
    .get();
  // array loop
  return featured;
}

// - Get Featured posts — /content/foryou
async function getForYouPosts() {
  const posts = db.collection('posts');
  const forYou = await posts.where('featured', '==', false).orderBy('timestamp')
    // .startAt(lastPost)
    .limit(3)
    .get();
  // array loop
  return forYou
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
  getResources
}
