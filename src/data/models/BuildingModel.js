import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

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
  lat: Number,
  lon: Number,
}, {
  _id: false,
});

const BuildingSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: AddressSchema,
  location: LocationSchema,
  description: String,
});

// https://github.com/drudge/mongoose-timestamp
BuildingSchema.plugin(timestamp);

const Building = mongoose.model('Building', BuildingSchema, 'Building');

export default Building;
