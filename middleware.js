
function postMiddleware(id, dbPost) {

    let ret = {
        id,
        timestamp: dbPost.timestamp,
        status: dbPost.status,
        user: dbPost.username,
        type: dbPost.type,
        title: dbPost.content.title,
        content: dbPost.content.body,
        image: dbPost.content.image || 'none',
        video: dbPost.content.video || 'none',
        audio: dbPost.content.audio || 'none',
        topics: dbPost.content.topics,
        likes: dbPost.likes,
        comments: dbPost.comments,
        // saves: dbPost.saves,
        // shares: dbPost.shares,
        // anonymous: dbPost.anonymous
    };
    return ret;
}

function userMiddleware(id, dbUser) {

    let ret = {
        id,
        email: dbUser.email,
        username: dbUser.username,
        type: dbUser.type,
        image: dbUser.image || 'none',
        bio: dbUser.bio || 'none',
        created: dbUser.created,
        saved: dbUser.saved,
        consent: dbUser.consent,
        notifSettings: dbUser.notifSettings
    };
    return ret;
}




module.exports = {
    postMiddleware,
    userMiddleware
};


// liked: dbPost.likes.includes(user) ? true : false