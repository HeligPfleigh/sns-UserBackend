import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';

// http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

function rolesvalidator(v) {
  return v.every(val => !!~['user'].indexOf(val));
}

const EmailSchema = new Schema({
  address: {
    type: String,
    required: true,
    sparse: true,
    index: true,
  },
  verified: {
    type: Boolean,
    required: true,
  },
}, {
  _id: false,
});

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  emails: EmailSchema,
  profile: Schema.Types.Mixed,
  services: Schema.Types.Mixed,
  roles: {
    required: true,
    type: [String],
    validate: rolesvalidator,
  },
  building: {
    type: ObjectId,
    ref: 'Building',
  },
  chatId: {
    type: String,
  },
});

// indexes
// UserSchema.index({
//   'title': 1
// });

// plugins
UserSchema.plugin(timestamps);

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
