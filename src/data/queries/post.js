import {
  GraphQLString as StringType,
} from 'graphql';

import PostSchemas from '../schemas/PostSchemas';
import { PostsModel } from '../models';

const post = {
  type: PostSchemas,
  args: {
    _id: { type: StringType },
  },
  resolve: async ({ request }, { _id }) => {
    const userId = request.user.id;
    const postResult = await PostsModel.findOne({ _id });
    postResult.likes.indexOf(userId) !== -1 ? postResult.isLiked = true : postResult.isLiked = false;

    return postResult;
  },
};

export default post;
