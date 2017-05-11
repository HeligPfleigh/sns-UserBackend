import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';
import { NOTIFY_TYPES } from '../../constants';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const NotificationSchema = new Schema({
  user: {
    type: ObjectId,
    ref: 'User',
    index: true,
  },
  type: {
    type: String,
    required: true,
    trim: true,
    enum: NOTIFY_TYPES,
    default: NOTIFY_TYPES[0],
    index: true,
  },
  seen: {
    type: Boolean,
    default: false,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  subject: {
    type: ObjectId,
    ref: 'Post',
  },
  actors: [{
    type: ObjectId,
    ref: 'User',
  }],
});

// https://github.com/drudge/mongoosetimestamp
NotificationSchema.plugin(timestamp);

const NotificationModel = mongoose.model('notification', NotificationSchema);

export default NotificationModel;
