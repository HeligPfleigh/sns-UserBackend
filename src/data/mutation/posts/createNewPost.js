import {
  GraphQLString as StringType,
} from 'graphql';
import isEqual from 'lodash/isEqual';

import PostSchemas from '../../schemas/PostSchemas';
import { sendPostNotification } from '../../../utils/notifications';
import { PostsModel } from '../../models';

const createNewPost = {
  type: PostSchemas,
  args: {
    message: { type: StringType },
    userId: { type: StringType },
  },
  resolve: ({ request }, { message, userId }) => new Promise(async (resolve, reject) => {
    try {
      JSON.parse(message);
      const author = request.user.id;
      const r = await PostsModel.create({
        message,
        author,
        user: userId || author,
      });

      if (userId && !isEqual(userId, author)) {
        sendPostNotification(r._id, author);
      }
      r.isLiked = false;
      resolve(r);
    } catch (e) {
      reject(e);
    }
  }),
};

export default createNewPost;
