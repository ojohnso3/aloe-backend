const UserSchema = {
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['MEMBER', 'ADMIN', 'MODERATOR'],
    required: true,
    default: 'MEMBER'
  },
  image: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  createdPosts: {
    // subcollection
  },
  savedPosts: {
    // subcollection
  },
  consent: {
    type: Boolean,
    default: false
  },
  anonymous: {
    type: String,
    enum: ['FULL', 'PARTIAL', 'NONE'],
    default: 'FULL'
  },
  notifications: {
    type: String,
    enum: ['', '', ''],
    default: ''
  },
  signupTimestamp: {
    type: Date,
    default: null
  },
  loginTimestamp: {
    type: Date,
    default: null
  },
}