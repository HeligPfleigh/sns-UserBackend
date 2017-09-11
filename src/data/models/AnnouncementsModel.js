import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';
import { PUBLIC, PRIVATE } from '../../constants';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const AnnouncementSchema = new Schema({
  _id: ObjectId,
  date: Date,
  message: String,
  description: String,
  privacy: {
    type: String,
    enum: [PUBLIC, PRIVATE],
    default: PUBLIC,
  },
  building: {
    type: ObjectId,
    ref: 'Building',
    index: true,
  },
  apartments: {
    type: [{
      type: ObjectId,
      ref: 'Apartment',
      unique: true,
      index: true,
    }],
    default: [],
  },
  isDeleted: {
    type: Boolean,
    index: true,
  },
});


// https://github.com/drudge/mongoose-timestamp
AnnouncementSchema.plugin(timestamp);

const AnnouncementsModel = mongoose.model('Announcement', AnnouncementSchema);

export default AnnouncementsModel;
