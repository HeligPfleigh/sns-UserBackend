import {
  PostsModel,
} from '../models';

function getPost(postId) {
  return PostsModel.findOne({ _id: postId });
}

function feed() {
  console.log('not implement yet');
  return [];
}
async function likePost(userId, postId) {
  await PostsModel.update(
        { _id: postId },
        { $addToSet: { likes: userId } },
      );
  return PostsModel.findById(postId);
}
export default {
  getPost,
  feed,
  likePost,
};
