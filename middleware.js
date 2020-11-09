

function postMiddleware(id, dbPost) {
    console.log(dbPost);
    let ret = {
        id,
        timestamp: dbPost.timestamp,
        status: dbPost.status,
        user: dbPost.username,
        type: dbPost.type,
        title: dbPost.title,
        content: dbPost.content.body,
        image: dbPost.content.media,
        video: dbPost.content.video || 'none',
        audio: dbPost.content.audio || 'none',
        topics: dbPost.content.topics,
        featured: dbPost.featured,
    };
    console.log(ret);
    return ret;
}

module.exports = {
    postMiddleware
};