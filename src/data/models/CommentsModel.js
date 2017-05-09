import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const CommentSchema = new Schema({
  user: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  post: {
    type: ObjectId,
    ref: 'Post',
    required: true,
    index: true,
  },
  message: {
    type: Schema.Types.Mixed,
    required: true,
    trim: true,
  },
  reply: {
    type: ObjectId,
    ref: 'Commment',
  },
});

// https://github.com/drudge/mongoose-timestamp
CommentSchema.plugin(timestamp);

const CommentModel = mongoose.model('Comment', CommentSchema);

export default CommentModel;
