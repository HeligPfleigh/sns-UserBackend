import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import bcrypt from 'bcrypt';

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

const PhoneSchema = new Schema({
  number: String,
  code: String,
  verified: Boolean,
}, {
  _id: false,
});

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: String,
  phone: PhoneSchema,
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

// plugins
UserSchema.plugin(timestamps);

// methods ======================
// generating a hash
UserSchema.methods.generateHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(), null);

// checking if password is valid
UserSchema.methods.validPassword = password => bcrypt.compareSync(password, this.password);

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
