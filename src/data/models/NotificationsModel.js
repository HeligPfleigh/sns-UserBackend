import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';
import { NOTIFY_TYPES } from '../../constants';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const NotificationSchema = new Schema({
  user: {
    type: ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    required: true,
    trim: true,
    enum: NOTIFY_TYPES,
    default: NOTIFY_TYPES[0],
  },
  seen: {
    type: Boolean,
    default: false,
  },
  subject: [{
    type: ObjectId,
    ref: 'Post',
  }],
  actors: [{
    type: ObjectId,
    ref: 'User',
  }],
});

// https://github.com/drudge/mongoosetimestamp
NotificationSchema.plugin(timestamp);

const NotificationModel = mongoose.model('Notification', NotificationSchema, 'Notification');

export default NotificationModel;
