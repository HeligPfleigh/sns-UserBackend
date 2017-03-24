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
  resolve: ({ request }, { _id }) => {
    const result = new Promise(async (resolve, reject) => {
      try {
        resolve(PostsModel.findOne({ _id }));
      } catch (e) {
        reject(e);
      }
    });

    return result;
  },
};

export default post;
