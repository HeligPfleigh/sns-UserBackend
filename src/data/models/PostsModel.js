import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';
import { POST_TYPES, POST_PRIVACY, PUBLIC, STATUS } from '../../constants';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const PostSchema = new Schema({
  type: {
    type: String,
    required: true,
    trim: true,
    enum: POST_TYPES,
    default: STATUS,
    index: true,
  },
  privacy: {
    type: String,
    required: true,
    trim: true,
    enum: POST_PRIVACY,
    default: PUBLIC,
    index: true,
  },
  isDeleted: {
    type: Boolean,
    index: true,
  },
  user: {
    type: ObjectId,
    ref: 'User',
    index: true,
  },
  author: {
    type: ObjectId,
    ref: 'User',
    index: true,
    required: true,
  },
  building: {
    type: ObjectId,
    ref: 'Building',
    index: true,
  },
  sharing: {
    type: ObjectId,
    ref: 'Post',
    index: true,
  },
  photos: {
    type: Array,
  },
  likes: [{
    type: ObjectId,
    ref: 'User',
  }],
  message: Schema.Types.Mixed,
  name: {
    type: String,
  },
  location: {
    type: String,
  },
  start: {
    type: Date,
  },
  end: {
    type: Date,
  },
  invites: [{
    type: ObjectId,
    ref: 'User',
    default: [],
  }],
  interests: [{
    type: ObjectId,
    ref: 'User',
    default: [],
  }],
  joins: [{
    type: ObjectId,
    ref: 'User',
    default: [],
  }],
});

// https://github.com/drudge/mongoosetimestamp
PostSchema.plugin(timestamp);

const PostModel = mongoose.model('Post', PostSchema);

export default PostModel;
