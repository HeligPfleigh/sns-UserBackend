import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const FeeSettingsSchema = new Schema({
  recommendedDatePayFee: {
    type: Number,
    default: 0,
    required: true,
  },
  automatedDateReminder: {
    type: Number,
    default: 0,
    required: true,
  },
  timeLimitationBetween2FeeNotifications: {
    type: Number,
    default: 0,
    required: true,
  },
}, { _id: false });

const BuildingSettingsSchema = new Schema({
  building: {
    type: ObjectId,
    ref: 'Building',
    required: true,
  },
  fee: {
    type: FeeSettingsSchema,
    required: true,
    default: [],
  },
});

// https://github.com/drudge/mongoose-timestamp
BuildingSettingsSchema.plugin(timestamp);

export default mongoose.model('BuildingSettings', BuildingSettingsSchema);
