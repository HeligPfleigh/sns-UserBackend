import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';

// http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;

const { Schema } = mongoose;
// const { Types: { ObjectId } } = Schema;

const EmailSchema = new Schema({
  address: {
    type: String,
    required: true,
    sparse: true,
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

});

// indexes
// UserSchema.index({
//   'title': 1
// });

// plugins
UserSchema.plugin(timestamps);

const User = mongoose.model('User', UserSchema, 'User');

export default User;
