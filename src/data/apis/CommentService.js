import isUndefined from 'lodash/isUndefined';
import { ObjectId } from 'mongodb';
import { ContentState, convertToRaw } from 'draft-js';
import {
  UsersModel,
  CommentsModel,
  PostsModel,
} from '../models';
import {
  sendCommentNotification,
} from '../../utils/notifications';
import { pubsub } from '../schema';
import { COMMENT_ADDED_SUBSCRIPTION } from '../../constants';

async function createNewComment(userId, postId, message, commentId = 'none', isMobile = false) {
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
  if (isUndefined(message)) {
    throw new Error('message is undefined');
  }
  if (isMobile) {
    const content = ContentState.createFromText(message);
    message = JSON.stringify(convertToRaw(content));
  } else {
    try {
      JSON.parse(message);
    } catch (error) {
      throw new Error('Post message invalid');
    }
  }
  const r = await CommentsModel.create({
    user: userId,
    post: postId,
    message,
    reply: (commentId && commentId !== 'none') ? commentId : undefined,
  });
  sendCommentNotification(postId, userId);

  // emit subscription when a comment is added
  pubsub.publish(COMMENT_ADDED_SUBSCRIPTION, { commentAdded: r });

  return r;
}


export default {
  createNewComment,
};
