import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const ApartmentSchema = new Schema({
  number: {
    type: String,
    required: true,
    trim: true,
  },
  building: {
    type: ObjectId,
    ref: 'Building',
  },
  user: {
    type: ObjectId,
    ref: 'User',
  },
  isOwner: {
    type: Boolean,
    default: true,
    required: true,
  },
});

// https://github.com/drudge/mongoose-timestamp
ApartmentSchema.plugin(timestamp);

const ApartmentModel = mongoose.model('Apartment', ApartmentSchema);

export default ApartmentModel;
