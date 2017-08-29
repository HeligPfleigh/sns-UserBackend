import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';
import { FEE_STATUS, UNPAID } from '../../constants';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const FeeTypeSchema = new Schema({
  code: {
    type: Number,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    unique: true,
    required: true,
  },
  icon: String,
});

FeeTypeSchema.plugin(timestamp);

const FeeTypeModel = mongoose.model('FeeType', FeeTypeSchema);

const FeeSchema = new Schema({
  type: {
    code: Number,
    name: String,
    icon: String,
  },
  from: {
    type: Date,
    required: true,
  },
  to: {
    type: Date,
    required: true,
  },
  apartment: {
    type: ObjectId,
    ref: 'Apartment',
  },
  building: {
    type: ObjectId,
    ref: 'Building',
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    trim: true,
    enum: FEE_STATUS,
    default: UNPAID,
    index: true,
  },
  description: String,
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
});

FeeSchema.plugin(timestamp);
const FeeModel = mongoose.model('Fee', FeeSchema);

export default FeeModel;

export {
  FeeTypeModel,
  FeeModel,
};

