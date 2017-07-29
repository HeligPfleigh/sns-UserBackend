import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;

const BuildingFeedSchema = new Schema({
  building: {
    type: ObjectId,
    ref: 'Building',
  },
  post: {
    type: ObjectId,
    ref: 'Post',
  },
});

// https://github.com/drudge/mongoose-timestamp
BuildingFeedSchema.plugin(timestamp);

const BuildingFeedModel = mongoose.model('BuildingFeed', BuildingFeedSchema);

export default BuildingFeedModel;
