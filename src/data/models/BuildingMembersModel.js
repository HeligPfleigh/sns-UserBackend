import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';
import { ADMIN, ACCEPTED, BUILDING_MEMBER_TYPE, MEMBER, BUILDING_MEMBER_STATUS, PENDING } from '../../constants';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const BuildingMembersSchema = new Schema({
  building: {
    type: ObjectId,
    ref: 'Building',
  },
  user: {
    type: ObjectId,
    ref: 'User',
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
});

// https://github.com/drudge/mongoose-timestamp
BuildingMembersSchema.plugin(timestamp);

const BuildingMembersModel = mongoose.model('BuildingMembers', BuildingMembersSchema);

// (async () => {
//   const buildingId = '58da279f0ff5af8c8be59c36';
//   const user = '58f9c1bf2d4581000484b188';
//   await BuildingMembersModel.remove({ building: buildingId, user })
//   const t = await BuildingMembersModel.findOne({ building: buildingId, user });
//   if (!t) {
//     await BuildingMembersModel.create({
//       building: buildingId,
//       user,
//       type: ADMIN,
//       status: ACCEPTED,
//     });
//   }
// })();

export default BuildingMembersModel;
