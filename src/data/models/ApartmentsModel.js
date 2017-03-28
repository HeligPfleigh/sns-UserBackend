import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const ApartmentSchema = new Schema({
  number: {
    type: String,
    required: true,
    trim: true,
  },
  building: {
    type: ObjectId,
    ref: 'Building',
  },
  user: {
    type: ObjectId,
    ref: 'User',
  },
  isOwner: {
    type: Boolean,
    default: true,
    required: true,
  },
});

// https://github.com/drudge/mongoose-timestamp
ApartmentSchema.plugin(timestamp);

const ApartmentModel = mongoose.model('Apartment', ApartmentSchema);

setTimeout(async () => {
  await ApartmentModel.remove({});
  if (await ApartmentModel.count() === 0) {
    await ApartmentModel.create({
      number: 23,
      building: '58da279f0ff5af8c8be59c36',
      user: '58d397f736055edc21c18452',
      isOwner: true,
    });
  }
  console.log(await ApartmentModel.find({}));
}, 0);

export default ApartmentModel;
