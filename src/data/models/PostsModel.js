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
  user: {
    type: ObjectId,
    ref: 'User',
    index: true,
    required: true,
  },
  author: {
    type: ObjectId,
    ref: 'User',
    index: true,
    required: true,
  },
  photos: {
    type: Array,
  },
  likes: [{
    type: ObjectId,
    ref: 'User',
  }],
  message: Schema.Types.Mixed,
});

// https://github.com/drudge/mongoosetimestamp
PostSchema.plugin(timestamp);

const PostModel = mongoose.model('Post', PostSchema);

export default PostModel;
