import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
// const { Types: { ObjectId } } = Schema;

const AddressSchema = new Schema({
  country: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  street: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  _id: false,
});

const LocationSchema = new Schema({
  type : { type: String, default: 'Point' },
  coordinates: [
    { type: "Number" }
  ]
}, {
  _id: false,
});

const BuildingSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: AddressSchema,
    required: true,
  },
  location: {
    type: LocationSchema,
    required: true,
  },
  description: String,
});

// https://github.com/drudge/mongoose-timestamp
BuildingSchema.plugin(timestamp);

BuildingSchema.index({ location: '2dsphere' });

const BuildingModel = mongoose.model('Building', BuildingSchema);

setTimeout(async () => {
  await BuildingModel.remove({});
  if (await BuildingModel.count() === 0) {
    await BuildingModel.create({
      name: 'Vinhomes Riverside',
      address: {
        country: 'vn',
        city: 'Ha Noi',
        state: 'Long Bien',
        street: 'No.7, Bang Lang 1 Street'
      },
      location: {
        type:"Point",
        coordinates:[105.7976544,21.0714764]
      },
      description: 'Vingroup Joint Stock Company'
    });
  }
  console.log(await BuildingModel.find({}));
}, 0);

export default BuildingModel;
