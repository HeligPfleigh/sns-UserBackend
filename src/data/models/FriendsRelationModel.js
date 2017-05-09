import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const FriendsRelationSchema = new Schema({
  user: {
    type: ObjectId,
    ref: 'User',
    index: true,
  },
  friend: {
    type: ObjectId,
    ref: 'User',
    index: true,
  },
  status: {
    type: String,
    required: true,
    trim: true,
    enum: ['NONE', 'PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED'],
    default: 'NONE',
    index: true,
  },
  isSubscribe: {
    type: Boolean,
    default: false,
    required: true,
  },
});

// https://github.com/drudge/mongoose-timestamp
FriendsRelationSchema.plugin(timestamp);

const FriendsRelation = mongoose.model('FriendsRelation', FriendsRelationSchema);

export default FriendsRelation;
