

function postMiddleware(id, dbPost) {
    console.log(dbPost);
    let ret = {
        id,
        timestamp: dbPost.timestamp,
        status: dbPost.status,
        user: dbPost.username,
        type: dbPost.type,
        title: dbPost.content.title,
        content: dbPost.content.body,
        image: dbPost.content.media,
        video: dbPost.content.video || 'none',
        audio: dbPost.content.audio || 'none',
        topics: dbPost.content.topics,
        likes: dbPost.likes,
        liked: true, // add later
        comments: []
    };
    console.log(ret);
    return ret;
}

module.exports = {
    postMiddleware
};