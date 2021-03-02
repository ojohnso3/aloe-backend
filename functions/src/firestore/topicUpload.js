const db = require('../firebase/db.js');
const helpers = require('../helpers.js');

const topicsArray = [
  "Abortion",
  "Advice",
  "Alcohol",
  "Birth Control",
  "Body Standards",
  "Child Grooming",
  "College",
  "Consent",
  "Dating Apps",
  'Domestic Abuse',
  "Drugs",
  "Film/TV",
  "Healing",
  "High School",
  "Hookup Culture",
  "Hygiene",
  "Kinks",
  "Masturbation",
  "Mental Health",
  "Music",
  "Porn",
  "Pregnancy",
  "Relationships",
  "Sexual Assault",
  "Sexual Orientation",
  "Sexual Pleasure",
  "Shame",
  "STIs",
  "Story",
  "Virginity",
]

async function parseTopics() {
  let allTopics = [];
  for (let i=0; i<topicsArray.length; i++) {
    const topic = topicsArray[i];

    const processedTopic = {
      topic: topic,
      description: 'Definition will be uploaded soon!',
      createdAt: helpers.Timestamp.now(),
      updatedAt: helpers.Timestamp.now(),
      source: 'ADMIN',
    };

    allTopics.push(processedTopic);
  }
  console.log('topics upload #: ', allTopics.length);
  return allTopics;
}

const createTopics = async () => {
  const parsedTopics = await parseTopics();
  parsedTopics.map(async (topic) => {
    await db.collection('topics').add(topic)
        .then(() => {
          console.log('successfully uploaded topic');
          return null;
        }).catch((e) => {
          console.error('something went wrong', e);
        });
  });
};

async function uploadTopics() {
  console.log('uploading posts!');
  createTopics();
}

// module.exports = {
//   uploadTopics,
// };
// uploadTopics();