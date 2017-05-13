import {
  GraphQLInt as IntType,
  GraphQLString as StringType,
} from 'graphql';

import {
  NotificationsModel,
} from '../models';
import NotificationsResultSchemas from '../schemas/NotificationsResultSchemas';

const notifications = {
  type: NotificationsResultSchemas,
  args: {
    limit: { type: IntType },
    cursor: { type: StringType },
  },
  resolve: async ({ request }, { limit = 20, cursor }) => {
    const userId = request.user.id;
    const edgesAndPageInfoPromise = new Promise((resolve, reject) => {
      const edgesArray = [];
      let edges = null;
      if (cursor) {
        edges = NotificationsModel.find({
          user: userId,
          _id: {
            $lt: cursor,
          },
        }).limit(limit).sort({ createdAt: -1 }).cursor();
      } else {
        edges = NotificationsModel.find({
          user: userId,
        }).limit(limit).sort({ createdAt: -1 }).cursor();
      }

      edges.on('data', (res) => {
        edgesArray.push(res);
      });

      edges.on('error', (err) => {
        reject(err);
      });

      edges.on('end', () => {
        const endCursor = edgesArray.length > 0 ? (edgesArray[edgesArray.length - 1])._id : null;
        const hasNextPageFlag = new Promise((_resolve, _reject) => {
          if (endCursor) {
            NotificationsModel.find({
              user: userId,
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

export default notifications;
