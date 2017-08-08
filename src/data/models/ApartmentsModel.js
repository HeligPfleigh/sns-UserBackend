import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const ApartmentSchema = new Schema({
  prefix: {
    type: String,
    required: true,
    trim: true,
  },
  number: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  building: {
    type: ObjectId,
    ref: 'Building',
    index: true,
  },
  owner: {
    type: ObjectId,
    ref: 'User',
    index: true,
  },
  users: [{
    type: ObjectId,
    ref: 'User',
    unique: true,
    index: true,
  }],
  isOwner: {
    type: Boolean,
    default: false,
    index: true,
  },
});

// https://github.com/drudge/mongoose-timestamp
ApartmentSchema.plugin(timestamp);

const ApartmentModel = mongoose.model('Apartment', ApartmentSchema);

export default ApartmentModel;
