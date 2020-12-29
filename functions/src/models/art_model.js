const ArtSchema = {
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  postID: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['APPROVED', 'REJECTED', 'SUBMITTED'],
    required: true,
  },
  content: {
    image: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
    caption: {
      type: String,
      default: null,
    },
    topics: [{
      type: String,
      default: null,
    }],
  },
  likes: {
    type: Number,
    default: null,
  },
  saves: {
    type: Number,
    default: null,
  },
  anonymous: {
    type: Boolean,
    default: true,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createTimestamp: {
    type: Date,
    default: null,
  },
  updateTimestamp: {
    type: Date,
    default: null,
  },
};
