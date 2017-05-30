
import isUndefined from 'lodash/isUndefined';
import { ObjectId } from 'mongodb';
import {
  UsersModel,
  CommentsModel,
  PostsModel,
} from '../models';


async function createNewComment(userId, postId, message, commentId) {
  if (isUndefined(userId)) {
    throw new Error('userId is undefined');
  }
  if (isUndefined(commentId)) {
    throw new Error('commentId is undefined');
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
  if (isUndefined(message)) {
    throw new Error('message is undefined');
  }
  await CommentsModel.create({
    user: userId,
    post: postId,
    message,
    reply: commentId || null,
  });

  return CommentsModel.findOne({ user: userId });
}


export default {
  createNewComment,
};
