import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const PostSchema = new Schema({
  type: {
    type: ObjectId,
    ref: 'PostType',
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

// https://github.com/drudge/mongoose-timestamp
PostSchema.plugin(timestamp);

const Post = mongoose.model('Post', PostSchema, 'Post');

export default Post;
