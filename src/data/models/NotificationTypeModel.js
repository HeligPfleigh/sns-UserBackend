import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
// const { Types: { ObjectId } } = Schema;

const NotificationTypeSchema = new Schema({
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
NotificationTypeSchema.plugin(timestamp);

const NotificationType = mongoose.model('NotificationType', NotificationTypeSchema, 'NotificationType');

export default NotificationType;
