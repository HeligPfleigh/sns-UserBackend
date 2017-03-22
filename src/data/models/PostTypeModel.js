import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
// const { Types: { ObjectId } } = Schema;

const PostTypeSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
});

// https://github.com/drudge/mongoose-timestamp
PostTypeSchema.plugin(timestamp);

const PostType = mongoose.model('PostType', PostTypeSchema, 'PostType');

export default PostType;
