import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';
import { TYPE1, ANNOUNCEMENT_TYPE } from '../../constants';

const { Schema } = mongoose;
// const { Types: { ObjectId } } = Schema;

const AddressSchema = new Schema({
  country: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  street: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  _id: false,
});

const LocationSchema = new Schema({
  type: { type: String, default: 'Point' },
  coordinates: [
    { type: 'Number' },
  ],
}, {
  _id: false,
});

const AnnouncementSchema = new Schema({
  date: Date,
  message: String,
  type: {
    type: String,
    required: true,
    trim: true,
    enum: ANNOUNCEMENT_TYPE,
    default: TYPE1,
  },
}, {
  _id: false,
});


const BuildingSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: AddressSchema,
    required: true,
  },
  location: {
    type: LocationSchema,
    required: true,
  },
  description: String,
  announcements: [AnnouncementSchema],
});

// https://github.com/drudge/mongoose-timestamp
BuildingSchema.plugin(timestamp);

BuildingSchema.index({ location: '2dsphere' });

const BuildingModel = mongoose.model('Building', BuildingSchema);

export default BuildingModel;
