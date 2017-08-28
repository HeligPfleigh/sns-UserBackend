import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const FAQSchema = new Schema({
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
  message: Schema.Types.Mixed,
});

// https://github.com/drudge/mongoosetimestamp
FAQSchema.plugin(timestamp);

export default mongoose.model('FAQ', FAQSchema);
