import {
  GraphQLString as StringType,
} from 'graphql';

import PostSchema from '../../schemas/PostSchemas';
import { PostsModel } from '../../models';

const likePost = {
  type: PostSchema,
  args: {
    postId: { type: StringType },
  },
  resolve: ({ request }, { postId }) => new Promise(async (resolve, reject) => {
    try {
      const userId = request.user.id;
      if (!userId || !postId) {
        throw new Error('Bad request.');
      }

      const result = await PostsModel.update(
        { _id: postId },
        { $addToSet: { likes: userId } },
      );

      if (result.nModified !== 1) {
        throw new Error('Update faild...');
      }

      const postObj = await PostsModel.findById(postId);
      postObj.isLiked = true;
      resolve(postObj);
    } catch (err) {
      reject(err);
    }
  }),
};

export default likePost;
