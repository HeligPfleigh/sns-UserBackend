import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';
import { POST_TYPES } from '../../constants';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const PostSchema = new Schema({
  type: {
    type: String,
    required: true,
    trim: true,
    enum: POST_TYPES,
    default: POST_TYPES[0],
  },
  user: {
    type: ObjectId,
    ref: 'User',
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
