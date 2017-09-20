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

const Emailchema = new Schema({
  address: {
    type: String,
    required: true,
    sparse: true,
    index: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  code: String,
  updateAt: {
    type: Date,
    default: new Date(),
  },
}, {
  _id: false,
});

const PhoneSchema = new Schema({
  number: String,
  verified: {
    type: Boolean,
    default: false,
  },
  code: String,
  updateAt: {
    type: Date,
    default: new Date(),
  },
}, {
  _id: false,
});

const PasswordSchema = new Schema({
  value: String,
  counter: {
    type: Number,
    default: 0,
  },
  code: String,
  updateAt: {
    type: Date,
    default: new Date(),
  },
}, {
  _id: false,
});

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: PasswordSchema,
  phone: PhoneSchema,
  email: Emailchema,
  profile: Schema.Types.Mixed,
  services: Schema.Types.Mixed,
  roles: {
    required: true,
    type: [String],
    validate: rolesvalidator,
    default: ['user'],
  },
  building: {
    type: ObjectId,
    ref: 'Building',
  },
  chatId: {
    type: String,
  },
  search: String,
  status: {
    type: Number, // 0 - not active, 1 - activated, 2 - deactive, 3 - lock
    default: 0,
    required: true,
  },
});

UserSchema.index({
  search: 'text',
});

// plugins
UserSchema.plugin(timestamps);

// methods ======================
// generating a hash
UserSchema.methods.generateHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(), null);

// checking if password is valid
UserSchema.methods.validPassword = password => bcrypt.compareSync(password, this.password.value);

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
