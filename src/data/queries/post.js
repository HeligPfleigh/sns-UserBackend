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
  resolve: ({ request }, { _id }) => PostsModel.findOne({ _id }),
};

export default post;
