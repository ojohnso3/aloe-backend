// add image later + content instead of body
const fakeComments = [
    {
        id: '123',
        user: 'sidthekid',
        content: 'You are so strong <3',
        likes: ['oj', 'sid'],
        timestamp: 'November Yomama'
    },
    {
        id: '0001',
        user: 'sidthekid',
        content: 'This is amazing!',
        likes: ['yomama', 'sid', 'porky', 'joebiden'],
        timestamp: 'October Yodada'
    }
]

const fakeResponses = [
    {
        id: '123',
        user: 'sidthekid',
        content: 'I think Euphoria romanticized unhealthy relationships.',
        likes: ['oj', 'sid'],
        timestamp: 'November Yomama'
    },
    {
        id: '0001',
        user: 'sidthekid',
        content: 'Episode 5 really triggered me.',
        likes: ['yomama', 'sid', 'porky', 'joebiden'],
        timestamp: 'October Yodada'
    }
]

const fakeAnswers = [
    {
        id: '123',
        choice: 'A',
    content: 'Yes!',
        users: ['oj', 'cam'],
    },
    {
        id: '999',
        choice: 'B',
        content: 'No.',
        users: ['oj', 'sid'],
    },
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

function promptMiddleware(id, dbPrompt, responses) {

    let ret = {
        id,
        timestamp: dbPrompt.timestamp,
        question: dbPrompt.prompt,
        answers: fakeResponses, // responses
        topics: dbPrompt.topics,
        image: dbPrompt.image

        // status: dbPost.status,
        // user: dbPost.username,
        // likes: dbPost.likes,
        // saves: dbPost.saves,
        // shares: dbPost.shares,
    };
    return ret;
}

function surveyMiddleware(id, dbPrompt, answers) {

    let ret = {
        id,
        timestamp: dbPrompt.timestamp,
        question: dbPrompt.header,
        answers: fakeAnswers, // answers

        // topics: dbPrompt.topics,
        // status: dbPost.status,
        // user: dbPost.username,
        // likes: dbPost.likes,
        // saves: dbPost.saves,
        // shares: dbPost.shares,
    };
    return ret;
}

function resourceMiddleware(id, dbResource) {

    let ret = {
        id,
        type: dbResource.type,
        name: dbResource.name,
        phone: dbResource.contact.phone || 'none',
        text: dbResource.contact.text || 'none',
        email: dbResource.contact.email || 'none',
        website: dbResource.contact.website || 'none',
        address: dbResource.contact.address || 'none',
        summary: dbResource.description.overview,
        confidentiality: dbResource.description.confidentiality,
        reporting: dbResource.description.reporting,
        image: dbResource.image,

        // timestamp: dbPrompt.timestamp,
    };
    return ret;
}


function userMiddleware(dbUser, created, saved) { // id?

    let ret = {
        password: "asdklfjadkls;fjkl;saj", // think about security
        email: dbUser.email,
        username: dbUser.username,
        type: dbUser.type,
        profilePicture: dbUser.image || 'none',
        bio: dbUser.bio || 'none',
        consentSetting: dbUser.consent,
        notifSettings: dbUser.notifSettings,
        posts: [], // created,
        saved: [], // saved,
        anonymous: false // remove

        // verified: dbUser.verified,
    };
    return ret;
}




module.exports = {
    postMiddleware,
    promptMiddleware,
    surveyMiddleware,
    resourceMiddleware,
    userMiddleware
};


// liked: dbPost.likes.includes(user) ? true : false