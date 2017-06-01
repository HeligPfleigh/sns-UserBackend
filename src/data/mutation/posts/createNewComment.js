import {
  GraphQLString as StringType,
} from 'graphql';

import CommentSchemas from '../../schemas/CommentSchemas';
import { sendCommentNotification } from '../../../utils/notifications';

import {
  PostsModel,
  CommentsModel,
} from '../../models';

const createNewComment = {
  type: CommentSchemas,
  args: {
    postId: { type: StringType },
    message: { type: StringType },
    commentId: { type: StringType },
  },
  resolve: ({ request }, { postId, message, commentId }) => new Promise(async (resolve, reject) => {
    try {
      // console.warn('check if user logged in or not');

      if (!postId || !message) {
        throw new Error('Bad request...');
      }

      const postObj = await PostsModel.findById({ _id: postId });
      if (!postObj) {
        throw new Error('The post not exists in database');
      }

      // try test format message
      JSON.parse(message);
      const r = await CommentsModel.create({
        user: request.user.id,
        post: postId,
        message,
        reply: commentId || null,
      });
      sendCommentNotification(postId, request.user.id);
      resolve(r);
    } catch (e) {
      reject(e);
    }
  }),
};

export default createNewComment;
