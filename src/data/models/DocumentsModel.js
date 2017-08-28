import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const DocumentSchema = new Schema({
  isDeleted: {
    type: Boolean,
    index: true,
  },
  author: {
    type: ObjectId,
    ref: 'User',
    index: true,
    required: true,
  },
  building: {
    type: ObjectId,
    ref: 'Building',
    index: true,
  },
  name: {
    type: String,
  },
  file: {
    type: String,
  },
});

// https://github.com/drudge/mongoosetimestamp
DocumentSchema.plugin(timestamp);

export default mongoose.model('Document', DocumentSchema);
