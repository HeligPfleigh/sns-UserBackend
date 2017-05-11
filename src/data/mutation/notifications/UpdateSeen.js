import NotificationSchema from '../../schemas/NotificationSchemas';
import { NotificationsModel } from '../../models';

const updateSeen = {
  type: NotificationSchema,
  args: {},
  resolve: ({ request }) => new Promise(async (resolve, reject) => {
    try {
      const userId = request.user.id;
      if (!userId) {
        throw new Error('Bad request.');
      }

      const result = await NotificationsModel.update(
        { user: userId },
        { $set: { seen: true } },
        { multi: true },
      );

      if (result.nModified < 1) {
        throw new Error('Update faild...');
      }

      const notify = await NotificationsModel.findOne({ user: userId });
      resolve(notify);
    } catch (err) {
      reject(err);
    }
  }),
};

export default updateSeen;
