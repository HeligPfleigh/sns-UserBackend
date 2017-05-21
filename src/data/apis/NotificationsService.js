import {
  NotificationsModel,
} from '../models';

function getNotification(notificationId) {
  return NotificationsModel.findOne({ _id: notificationId });
}

export default {
  getNotification,

};
