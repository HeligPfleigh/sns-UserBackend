
import isUndefined from 'lodash/isUndefined';
import { ObjectId } from 'mongodb';
import {
  UsersModel,
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
  if (isUndefined(userId)) {
    throw new Error('userId is undefined');
  }

  if (isUndefined(postId)) {
    throw new Error('postId is undefined');
  }
  if (!await PostsModel.findOne({ _id: new ObjectId(postId) })) {
    throw new Error('postId does not exist');
  }
  if (!await UsersModel.findOne({ _id: new ObjectId(userId) })) {
    throw new Error('userId does not exist');
  }
  await PostsModel.update(
    { _id: postId },
    { $addToSet: { likes: userId } },
  );
  return PostsModel.findOne({ _id: postId });
}
export default {
  getPost,
  feed,
  likePost,
};
