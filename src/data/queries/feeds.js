import {
  GraphQLInt as IntType,
  GraphQLString as StringType,
  GraphQLList,
} from 'graphql';
import FeedsResultItemConnectionSchemas from '../schemas/FeedsResultItemConnectionSchemas';
import {
  PostsModel,
  FriendsRelationModel as FriendsModel,
} from '../models';
import mongoose from 'mongoose';
const { Types: { ObjectId } } = mongoose;

function toObjectId(idStr) {
  let id = null;
  try {
    id = ObjectId(idStr);
  } catch (err) {}
  return id;
}

function isObjectId (id) {
  return id instanceof ObjectId;
}


const feeds = {
  type: FeedsResultItemConnectionSchemas,
  args: {
    limit: { type: IntType },
    cursor: { type: StringType }
  },
  resolve: async ({ request }, {limit = 5, cursor}) => {
    const userId = request.user.id;
    let friendListByIds = await FriendsModel.find({user: userId}).select('friend _id');
    friendListByIds = friendListByIds.map((v) => v.friend);
    friendListByIds.push(userId);
    friendListByIds = friendListByIds.map(toObjectId);
    const edgesAndPageInfoPromise = new Promise((resolve,reject) => {
      let edgesArray = []
      let edges = null;
      if (cursor) {
        edges = PostsModel.find({
          user: {$in: friendListByIds },
          _id: {
            $lt: cursor
          },
        })
        .limit(limit)
        .sort({createdAt: -1}).cursor();
      }
      else {
        edges = PostsModel.find({
          user: {$in: friendListByIds },
        })
        .limit(limit)
        .sort({createdAt: -1}).cursor();
      }

      edges.on('data', res => {
        edgesArray.push(res);
      });

      edges.on('error', err => {
        reject(err);
      });

      edges.on('end', () => {
        let endCursor = edgesArray.length > 0 ? edgesArray[edgesArray.length-1]._id : null;
        let hasNextPageFlag = new Promise((resolve,reject) => {
          if (endCursor){
            PostsModel.find({
              user: {$in: friendListByIds },
              _id: {
                $lte: endCursor
              }
            }).count((err, count)=>{
              count > 0 ? resolve(true) : resolve(false);
            })
          }
          else resolve(false);
        });

        resolve(
          {
            edges: edgesArray,
            pageInfo:{
              endCursor: endCursor,
              hasNextPage: hasNextPageFlag
            }
          }
        );
      });
    });
    let returnValue = Promise.all([edgesAndPageInfoPromise]).then((values) => {
      return {
        edges: values[0].edges,
        // totalCount: values[1],
        pageInfo: {
          endCursor: values[0].pageInfo.endCursor,
          hasNextPage: values[0].pageInfo.hasNextPage
        }
      };
    });
    return returnValue;
  },
};

export default feeds;
