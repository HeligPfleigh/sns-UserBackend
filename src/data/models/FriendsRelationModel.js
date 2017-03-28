import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const FriendsRelationSchema = new Schema({
  user: {
    type: ObjectId,
    ref: 'User',
  },
  friend: {
    type: ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    required: true,
    trim: true,
    enum: ['NONE', 'PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED'],
    default: 'NONE',
  },
  isSubscribe: {
    type: Boolean,
    default: false,
    required: true,
  },
});

// https://github.com/drudge/mongoose-timestamp
FriendsRelationSchema.plugin(timestamp);

const FriendsRelation = mongoose.model('FriendsRelation', FriendsRelationSchema, 'FriendsRelation');

export default FriendsRelation;
