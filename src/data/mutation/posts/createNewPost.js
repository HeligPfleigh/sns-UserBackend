import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as Boolean,
} from 'graphql';

import PostSchemas from '../../schemas/PostSchemas';
import { PostsModel } from '../../models';

const createNewPost = {
  type: PostSchemas,
  args: {
    message: { type: StringType },
  },
  resolve: ({ request }, { message }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const r = await PostsModel.create({
          message,
          user: request.user.id,
        });
        resolve(r);
      }
      catch (e) {
        reject(e);
      }
    });
  },
};

export default createNewPost;
