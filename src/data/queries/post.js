import {
  GraphQLString as StringType,
  GraphQLList,
} from 'graphql';
import PostSchemas from '../schemas/PostSchemas';
import {
  PostsModel,
} from '../models';

const post = {
  type: PostSchemas,
  args: {
    _id: { type: StringType },
  },
  resolve: ({ request }, { _id }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const r = PostsModel.findOne({_id});
        resolve(r);
      }
      catch (e) {
        reject(e);
      }
    });
  },
};

export default post;
