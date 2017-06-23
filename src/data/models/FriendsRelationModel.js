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

const FriendsRelationModel = mongoose.model('FriendsRelation', FriendsRelationSchema);

(async () => {
  const userId = '58f9c1bf2d4581000484b188';
  const friendId = '58f9d2132d4581000484b1a0';
  await FriendsRelationModel.remove({
    user: friendId,
    friend: userId,
  });
  await FriendsRelationModel.create({
    user: friendId,
    friend: userId,
    status: 'PENDING',
    isSubscribe: true,
  });
})();

export default FriendsRelationModel;
