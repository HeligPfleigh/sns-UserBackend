import mongoose from 'mongoose';
import {
  GraphQLInt as IntType,
  GraphQLString as StringType,
} from 'graphql';

import {
  PostsModel,
  FriendsRelationModel as FriendsModel,
} from '../models';
import FeedsResultItemConnectionSchemas from '../schemas/FeedsResultItemConnectionSchemas';

const { Types: { ObjectId } } = mongoose;

const toObjectId = (idStr) => {
  let id = null;
  try {
    id = ObjectId(idStr);
  } catch (err) {
    throw err;
  }
  return id;
};

// function isObjectId(id) {
//   return id instanceof ObjectId;
// }

const feeds = {
  type: FeedsResultItemConnectionSchemas,
  args: {
    limit: { type: IntType },
    cursor: { type: StringType },
    owner: { type: StringType },
  },
  resolve: async ({ request }, { limit = 5, cursor, owner }) => {
    const userId = request.user.id;
    let friendListByIds = await FriendsModel.find({ user: userId }).select('friend _id');
    friendListByIds = friendListByIds.map(v => v.friend);
    friendListByIds.push(userId);
    friendListByIds = friendListByIds.map(toObjectId);
    const edgesAndPageInfoPromise = new Promise((resolve, reject) => {
      const edgesArray = [];
      let edges = null;
      let options = {
        user: { $in: friendListByIds },
      };

      if (owner) {
        options = {
          $or: [
            { author: owner },
            { user: owner },
          ],
        };
      }

      if (cursor) {
        options._id = {
          $lt: cursor,
        };
      }

      edges = PostsModel.find(options)
      .limit(limit)
      .sort({ createdAt: -1 }).cursor();

      edges.on('data', async (res) => {
        res.likes.indexOf(userId) !== -1 ? res.isLiked = true : res.isLiked = false;
        edgesArray.push(res);
      });

      edges.on('error', (err) => {
        reject(err);
      });

      edges.on('end', () => {
        const endCursor = edgesArray.length > 0 ? (edgesArray[edgesArray.length - 1])._id : null;
        const hasNextPageFlag = new Promise((_resolve, _reject) => {
          if (endCursor) {
            PostsModel.find({
              user: { $in: friendListByIds },
              _id: { $lte: endCursor },
            }).count((err, count) => {
              if (err) _reject(err);
              (count > 0) ? _resolve(true) : _resolve(false);
            });
          } else {
            _resolve(false);
          }
        });

        resolve({
          edges: edgesArray,
          pageInfo: {
            endCursor,
            hasNextPage: hasNextPageFlag,
          },
        });
      });
    });

    const returnValue = Promise.all([edgesAndPageInfoPromise]).then((values) => {
      const result = {
        edges: values[0].edges,
        // totalCount: values[1],
        pageInfo: {
          endCursor: values[0].pageInfo.endCursor,
          hasNextPage: values[0].pageInfo.hasNextPage,
        },
      };
      return result;
    });

    return returnValue;
  },
};

export default feeds;
