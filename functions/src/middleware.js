const helpers = require('./helpers.js');

function adminMiddleware(id, dbPost, userInfo) {
  const ret = {
    id,
    createdTimestamp: helpers.timestampToDate(dbPost.createdAt),
    updatedTimestamp: helpers.timestampToDate(dbPost.updatedAt),
    status: dbPost.status,
    notes: dbPost.adminNotes,
    userID: dbPost.userID,
    username: userInfo.username || 'No Corresponding User',
    profilePic: userInfo.profilePic || 'none',
    verified: userInfo.verified || false,
    content: dbPost.content.body,
    topics: dbPost.content.topics,
    anonymous: dbPost.anonymous,
    blurred: dbPost.blurred,
    likes: dbPost.numLikes,
    shares: dbPost.numShares,
  };

  return ret;
}

function userMiddleware(id, dbUser) {
  const ret = {
    userid: id,
    username: dbUser.username,
    type: dbUser.type,
    verified: dbUser.verified,
    profilePicture: dbUser.profilePic || '',
    pronouns: dbUser.pronouns || '',
    sexuality: dbUser.sexuality || '',
    triggers: dbUser.triggers || [],
    doc: helpers.timestampToDate(dbUser.doc),
    consentSetting: dbUser.consent,
    notifSettings: dbUser.notifications || true,
  };

  return ret;
}

function profileMiddleware(id, dbUser) {
  const ret = {
    userid: id,
    username: dbUser.username,
    verified: dbUser.verified || false,
    profilePicture: dbUser.profilePic || '',
    doc: helpers.timestampToDate(dbUser.doc),
    pronouns: dbUser.pronouns || '',
    sexuality: dbUser.sexuality || '',
  };
  return ret;
}

function postMiddleware(id, dbPost, userInfo) {
  const ret = {
    id,
    timestamp: helpers.timestampToDate(dbPost.updatedAt),
    status: dbPost.status,
    userid: userInfo.userID,
    user: userInfo.username,
    profilePicture: userInfo.profilePic || '',
    verified: userInfo.verified || false,
    pronouns: userInfo.pronouns || '',
    sexuality: userInfo.sexuality || '',
    content: dbPost.content.body,
    topics: dbPost.content.topics,
    anonymous: dbPost.anonymous,
    blurred: dbPost.blurred,
    likes: dbPost.numLikes,
    shares: dbPost.numShares,
    notes: dbPost.adminNotes,
  };
  return ret;
}

function promptMiddleware(id, dbPrompt, userInfo) {
  const ret = {
    id,
    timestamp: helpers.timestampToDate(dbPrompt.updatedAt),
    userid: userInfo.userID,
    user: userInfo.username,
    profilePicture: userInfo.profilePic || '',
    verified: userInfo.verified || true,
    question: dbPrompt.prompt,
    image: dbPrompt.image,
    topics: dbPrompt.topics,
    likes: dbPrompt.numLikes,
    shares: dbPrompt.numShares,
    responses: dbPrompt.numResponses,
  };
  return ret;
}

function responseMiddleware(id, dbResponse, userInfo) {
  const ret = {
    id,
    userid: userInfo.userID,
    user: userInfo.username,
    profilePicture: userInfo.profilePic || '',
    verified: userInfo.verified || false,
    content: dbResponse.body,
    replyTo: dbResponse.replyID,
    hasReplies: dbResponse.replies > 0 ? true : false,
    anonymous: dbResponse.anonymous,
    likes: dbResponse.numLikes,
    timestamp: helpers.timestampToDate(dbResponse.createdAt),
    lifetime: helpers.getTimeFromNow(dbResponse.createdAt),
  };
  return ret;
}

function reportMiddleware(id, dbReport) {
  const ret = {
    id,
    userID: dbReport.userID,
    parentID: dbReport.parentID,
    type: dbReport.type,
    reason: dbReport.reason || 'What is the reason??',
    timestamp: helpers.timestampToDate(dbReport.createdAt),
    status: dbReport.status,
  };

  return ret;
}

function resourceMiddleware(id, dbResource) {
  const ret = {
    id,
    name: dbResource.name,
    type: dbResource.type,
    contact: dbResource.contact,
    description: dbResource.description,
    confidentiality: dbResource.confidentiality,
  };
  return ret;
}

module.exports = {
  adminMiddleware,
  userMiddleware,
  profileMiddleware,
  postMiddleware,
  promptMiddleware,
  responseMiddleware,
  reportMiddleware,
  resourceMiddleware,
};
