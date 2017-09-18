import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const FeeSettingsSchema = new Schema({
  automatedReminderAfterHowDays: {
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

const FeeNotificationsSchema = new Schema({
  code: {
    type: Number,
    default: 0,
    required: true,
  },
  deadline: {
    type: Date,
    default: Date.now,
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
  feeNotifications: {
    type: [FeeNotificationsSchema],
    required: true,
    default: [],
  },
});

// https://github.com/drudge/mongoose-timestamp
BuildingSettingsSchema.plugin(timestamp);

export default mongoose.model('BuildingSettings', BuildingSettingsSchema);
