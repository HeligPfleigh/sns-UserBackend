import {
  GraphQLString as StringType,
} from 'graphql';

import PostSchemas from '../../schemas/PostSchemas';
import { PostsModel } from '../../models';

const createNewPost = {
  type: PostSchemas,
  args: {
    message: { type: StringType },
  },
  resolve: ({ request }, { message }) => new Promise(async (resolve, reject) => {
    try {
      JSON.parse(message);
      const r = await PostsModel.create({
        message,
        user: request.user.id,
      });
      resolve(r);
    } catch (e) {
      reject(e);
    }
  }),
};

export default createNewPost;
