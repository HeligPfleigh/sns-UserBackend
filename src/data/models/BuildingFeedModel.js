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
//   let postId = '5919693d13f21febf8a10500';
//   let t = await BuildingFeedModel.findOne({ building: buildingId, post: postId });
//   if (!t) {
//     await BuildingFeedModel.create({ building: buildingId, post: postId });
//   }

//   postId = '591968d513f21febf8a104ff';
//   t = await BuildingFeedModel.findOne({ building: buildingId, post: postId });
//   if (!t) {
//     await BuildingFeedModel.create({ building: buildingId, post: postId });
//   }

//   postId = '5919688b13f21febf8a104fe';
//   t = await BuildingFeedModel.findOne({ building: buildingId, post: postId });
//   if (!t) {
//     await BuildingFeedModel.create({ building: buildingId, post: postId });
//   }

//   postId = '5919681013f21febf8a104fd';
//   t = await BuildingFeedModel.findOne({ building: buildingId, post: postId });
//   if (!t) {
//     await BuildingFeedModel.create({ building: buildingId, post: postId });
//   }
// })();

export default BuildingFeedModel;
