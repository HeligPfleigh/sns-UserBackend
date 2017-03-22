import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const NotificationSchema = new Schema({
  user: {
    type: ObjectId,
    ref: 'User',
  },
  type: {
    type: ObjectId,
    ref: 'NotificationType',
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

// https://github.com/drudge/mongoose-timestamp
NotificationSchema.plugin(timestamp);

const Notification = mongoose.model('Notification', NotificationSchema, 'Notification');

export default Notification;
