import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';
import { EVENT_PRIVACY, PRIVATE_EVENT, PUBLIC_EVENT } from '../../constants';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const EventSchema = new Schema({
  privacy: {
    type: String,
    required: true,
    trim: true,
    enum: EVENT_PRIVACY,
    default: PUBLIC_EVENT,
    index: true,
  },
  isDeleted: {
    type: Boolean,
    index: true,
    default: false,
  },
  author: {
    type: ObjectId,
    ref: 'User',
    index: true,
    required: true,
  },
  building: {
    type: ObjectId,
    ref: 'Building',
    index: true,
  },
  banner: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  invites: [{
    type: ObjectId,
    ref: 'User',
    default: [],
  }],
  interests: [{
    type: ObjectId,
    ref: 'User',
    default: [],
  }],
  joins: [{
    type: ObjectId,
    ref: 'User',
    default: [],
  }],
});

EventSchema.plugin(timestamp);

const EventModel = mongoose.model('Event', EventSchema);

export default EventModel;
