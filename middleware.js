const fakeComments = [
    {
        id: '123',
        body: 'you suck boy',
        likes: ['oj', 'sid']
    },
    {
        id: '0001',
        body: 'sausage fest',
        likes: ['yomama', 'sid', 'porky', 'joebiden']
    }
]


function postMiddleware(id, dbPost, comments) {

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
        comments: fakeComments
        // comments: comments,
        // saves: dbPost.saves,
        // shares: dbPost.shares,
        // anonymous: dbPost.anonymous
    };
    // console.log('re', ret)
    return ret;
}

function userMiddleware(id, dbUser) {

    let ret = {
        id,
        email: dbUser.email,
        username: dbUser.username,
        type: dbUser.type,
        verified: dbUser.verified,
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