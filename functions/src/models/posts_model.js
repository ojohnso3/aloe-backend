const ResourceSchema = {
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['STORY', 'OPINION', 'ART', 'SHORT', 'SURVEY'],
    required: true,
  },
  status: {
    type: String,
    enum: ['APPROVED', 'REJECTED', 'SUBMITTED'],
    required: true,
  },
  content: {
    title: {
      type: String,
      default: null,
    },
    body: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    video: {
      type: String,
      default: null,
    },
    audio: {
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
