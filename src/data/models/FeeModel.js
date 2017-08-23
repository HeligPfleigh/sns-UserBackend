import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';
import { FEE_STATUS, PAID, UNPAID } from '../../constants';

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
});

FeeTypeSchema.plugin(timestamp);

const FeeTypeModel = mongoose.model('FeeType', FeeTypeSchema);

const FeeSchema = new Schema({
  type: {
    code: Number,
    name: String,
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
  payment: {
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
});

FeeSchema.plugin(timestamp);
const FeeModel = mongoose.model('Fee', FeeSchema);

export {
  FeeTypeModel,
  FeeModel,
};

export default FeeModel;
