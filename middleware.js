

function postMiddleware(id, dbPost) {
    let ret = {
        id,
        timestamp: dbPost.createTimestamp,
        status: dbPost.status,
        user: dbPost.username,
        type: dbPost.type,
        title: dbPost.type,
        content: dbPost.content.body,
        image: dbPost.content.image,
        video: dbPost.content.video,
        audio: dbPost.content.audio,
        topics: dbPost.content.topics,
        featured: dbPost.featured,
    };
    console.log(ret);
    return ret;
}

module.exports = {
    postMiddleware
};