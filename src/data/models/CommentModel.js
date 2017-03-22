import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const CommentSchema = new Schema({
  user: {
    type: ObjectId,
    ref: 'User',
  },
  post: {
    type: ObjectId,
    ref: 'Post',
  },
  message: Schema.Types.Mixed,
  reply: [{
    type: ObjectId,
    ref: 'Commment',
  }],
});

// https://github.com/drudge/mongoose-timestamp
CommentSchema.plugin(timestamp);

const Comment = mongoose.model('Comment', CommentSchema, 'Comment');

export default Comment;
