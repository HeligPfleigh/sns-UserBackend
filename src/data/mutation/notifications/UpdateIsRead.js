import {
  GraphQLString as StringType,
} from 'graphql';

import NotificationSchema from '../../schemas/NotificationSchemas';
import { NotificationsModel } from '../../models';

const updateSeen = {
  type: NotificationSchema,
  args: {
    _id: { type: StringType },
  },
  resolve: ({ request }, { _id }) => new Promise(async (resolve, reject) => {
    try {
      const userId = request.user.id;
      if (!userId || !_id) {
        throw new Error('Bad request.');
      }

      const result = await NotificationsModel.update(
        { _id },
        { $set: { isRead: true } },
      );

      if (result.nModified < 1) {
        throw new Error('Update faild...');
      }

      const notify = await NotificationsModel.findById(_id);
      resolve(notify);
    } catch (err) {
      reject(err);
    }
  }),
};

export default updateSeen;
