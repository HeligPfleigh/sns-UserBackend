import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const FollowsRelationSchema = new Schema({
  user: {
    type: ObjectId,
    ref: 'User',
  },
  following: {
    type: ObjectId,
    ref: 'User',
  },
  isFollow: {
    type: Boolean,
    default: false,
    required: true,
  },
});

// https://github.com/drudge/mongoose-timestamp
FollowsRelationSchema.plugin(timestamp);

const FollowsRelation = mongoose.model('FollowsRelation', FollowsRelationSchema, 'FollowsRelation');

export default FollowsRelation;
