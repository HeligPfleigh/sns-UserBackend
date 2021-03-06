import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';
import { BUILDING_MEMBER_TYPE, MEMBER, BUILDING_MEMBER_STATUS, PENDING } from '../../constants';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const BuildingMembersSchema = new Schema({
  building: {
    type: ObjectId,
    ref: 'Building',
    required: true,
  },
  user: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    trim: true,
    enum: BUILDING_MEMBER_TYPE,
    default: MEMBER,
  },
  status: {
    type: String,
    required: true,
    trim: true,
    enum: BUILDING_MEMBER_STATUS,
    default: PENDING,
  },
  requestInformation: {
    apartments: [{
      type: ObjectId,
      ref: 'Apartment',
      unique: true,
      index: true,
    }],
    detail: Schema.Types.Mixed,
  },
  message: Schema.Types.Mixed,
});

// https://github.com/drudge/mongoose-timestamp
BuildingMembersSchema.plugin(timestamp);

const BuildingMembersModel = mongoose.model('BuildingMembers', BuildingMembersSchema);

export default BuildingMembersModel;
