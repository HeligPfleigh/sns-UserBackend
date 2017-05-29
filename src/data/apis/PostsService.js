
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

async function unlikePost(userId, postId) {
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
  if (!await PostsModel.findOne({
    _id: postId,
    likes: { $in: [userId] },
  })) {
    throw new Error('not found like of user in this post');
  }
  await PostsModel.update(
        { _id: postId },
        { $pull: { likes: userId } },
      );
  return PostsModel.findOne({ _id: postId });
}
async function createNewPost(userId, message) {
  if (isUndefined(userId)) {
    throw new Error('userId is undefined');
  }

  if (isUndefined(message)) {
    throw new Error('message is undefined');
  }

  if (!await UsersModel.findOne({ _id: new ObjectId(userId) })) {
    throw new Error('userId does not exist');
  }
  await PostsModel.create({
    message,
    author: userId,
    user: userId,
  });
  return PostsModel.findOne({ user: userId, message });
}
export default {
  getPost,
  feed,
  likePost,
  unlikePost,
  createNewPost,
};
