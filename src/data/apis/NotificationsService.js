import isUndefined from 'lodash/isUndefined';
import { ObjectId } from 'mongodb';
import {
  NotificationsModel,
  UsersModel,
} from '../models';
import {
  RESOURCE_UPDATED_SUCCESSFULLY,
} from '../../constants';

function getNotification(notificationId) {
  return NotificationsModel.findOne({ _id: notificationId });
}
async function updateSeen(userId) {
  if (isUndefined(userId)) {
    throw new Error('userId is undefined');
  }
  if (!await UsersModel.findOne({ _id: new ObjectId(userId) })) {
    throw new Error('userId does not exist');
  }
  await NotificationsModel.update(
    { user: userId },
    { $set: { seen: true } },
    { multi: true },
  );
  return {
    response: RESOURCE_UPDATED_SUCCESSFULLY,
  };
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
    { _id: notificationId },
    { $set: { isRead: true, user: userId } },
  )) {
    throw new Error('Update faild...');
  }
  await NotificationsModel.update(
    { _id: notificationId },
    { $set: { isRead: true, user: userId } },
  );
  return NotificationsModel.findOne({ user: userId });
}
export default {
  updateRead,
  updateSeen,
  getNotification,
};
