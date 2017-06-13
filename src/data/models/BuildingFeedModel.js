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

// (async () => {
//   const buildingId = '58da279f0ff5af8c8be59c36';
//   const postId = '5919693d13f21febf8a10500';
//   const t = await BuildingFeedModel.findOne({ building: buildingId, post: postId });
//   if (!t) {
//     await BuildingFeedModel.create({ building: buildingId, post: postId });
//   }
// })();

export default BuildingFeedModel;
