import isUndefined from 'lodash/isUndefined';
import { ObjectId } from 'mongodb';
import {
  NotificationsModel,
  UsersModel,
} from '../models';

function getNotification(notificationId) {
  return NotificationsModel.findOne({ _id: notificationId });
}
async function updateSeen(userId, notificationId) {
  if (isUndefined(userId)) {
    throw new Error('userId is undefined');
  }
  if (!await UsersModel.findOne({ _id: new ObjectId(userId) })) {
    throw new Error('userId does not exist');
  }
  if (isUndefined(notificationId)) {
    throw new Error('notificationId is undefined');
  }
  if (!await NotificationsModel.findOne({ _id: notificationId })) {
    throw new Error('notificationId does not exist');
  }

  if (!await NotificationsModel.update(
         { _id: notificationId },
        { $set: { seen: true, user: userId } },
        { multi: true },
      )) {
    throw new Error('Update faild...');
  }
  await NotificationsModel.update(
        { _id: notificationId },
        { $set: { seen: true, user: userId } },
        { multi: true },
      );
  return NotificationsModel.findOne({ user: userId });
}
async function updateRead(userId, notificationId) {
  if (isUndefined(userId)) {
    throw new Error('userId is undefined');
  }
  if (!await UsersModel.findOne({ _id: new ObjectId(userId) })) {
    throw new Error('userId does not exist');
  }
  if (isUndefined(notificationId)) {
    throw new Error('notificationId is undefined');
  }
  if (!await NotificationsModel.findOne({ _id: new ObjectId(notificationId) })) {
    throw new Error('notificationId does not exist');
  }

  if (!await NotificationsModel.update(
        { notificationId },
        { $set: { isRead: true } },
      )) {
    throw new Error('Update faild...');
  }
  await NotificationsModel.update(
        { notificationId },
        { $set: { isRead: true } },
      );
  return NotificationsModel.findOne({ _id: notificationId });
}
export default {
  updateRead,
  updateSeen,
  getNotification,
};
