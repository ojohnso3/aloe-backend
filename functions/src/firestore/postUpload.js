const db = require('../firebase/db.js');
const processing = require('../processing.js');
const helpers = require('../helpers.js');

async function parseCSV(csvData) {
  const allPosts = [];
  for (let i=0; i<csvData.length; i++) {
    const postData = csvData[i];

    const processedPost = processing.postProcessing(postData);

    allPosts.push(processedPost);
  }
  console.log('posts upload #: ', allPosts.length);
  return allPosts;
}

const createResources = async (csvData) => {
  const parsedPosts = await parseCSV(csvData);
  parsedPosts.map(async (post) => {

    await db.collection('posts').add(post)
        .then(() => {
          console.log('successfully uploaded post');
          return null;
        }).catch((e) => {
          console.error('something went wrong', e);
        });
  });
};

async function uploadPosts() {
  helpers.csvtojson()
      .fromFile('./functions/src/betaPosts.csv')
      .then((csvData) => {
        createResources(csvData);
      });
}

uploadPosts();