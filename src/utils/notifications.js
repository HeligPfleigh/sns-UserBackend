import * as _ from 'lodash';
import {
  NotificationsModel,
  CommentsModel,
  PostsModel,
  UsersModel,
  ApartmentsModel,
} from '../data/models';
import {
  LIKES,
  COMMENTS,
  NEW_POST,
  ACCEPTED_FRIEND,
  FRIEND_REQUEST,
  EVENT_INVITE,
  EVENT_DELETED,
  EVENT_CANCELLED,
  ACCEPTED_JOIN_BUILDING,
  REJECTED_JOIN_BUILDING,
  SHARING_POST,
  INTEREST_EVENT,
  DISINTEREST_EVENT,
  NEW_FEE_APARTMENT,
  NEW_ANNOUNCEMENT,
  REMIND_FEE,
  NOTIFICATION_ADDED_SUBSCRIPTION,
} from '../constants';
import { pubsub } from '../data/schema';

const getUserFollow = async (postId, userId, status) => {
  const post = await PostsModel.findById(postId).select('likes user author');
  const comments = await CommentsModel.find({ post: postId }).select('user');

  const userLikes = post.likes;
  const userComment = _.uniq(_.map(comments, 'user'));
  let list = _.uniqWith(_.union([post.user], [post.author], userLikes, userComment), _.isEqual);
  list = _.reject(list, item => item.equals(userId));

  list.forEach(async (userFollow) => {
    const options = {
      user: userFollow,
      subject: postId,
      seen: false,
      type: status,
    };

    let notify = await NotificationsModel.findOne(options);

    if (!notify) {
      notify = await NotificationsModel.create({
        ...options,
        actors: [userId],
      });
    } else if (!_.some(notify.actors, item => item.equals(userId))) {
      notify.actors.unshift(userId);
      notify = await notify.save();
    }

    pubsub.publish(NOTIFICATION_ADDED_SUBSCRIPTION, { notificationAdded: notify });
  });
  return null;
};

function sendLikeNotification(postId, userId) {
  getUserFollow(postId, userId, LIKES);
}

function sendCommentNotification(postId, userId) {
  getUserFollow(postId, userId, COMMENTS);
}

function sendPostNotification(postId, userId) {
  getUserFollow(postId, userId, NEW_POST);
}

function sendEventInviteNotification(author, eventId, usersId) {
  usersId.forEach(async (id) => {
    const options = {
      user: id,
      subject: eventId,
      seen: false,
      type: EVENT_INVITE,
    };

    let notify = await NotificationsModel.findOne(options);

    if (!notify) {
      notify = await NotificationsModel.create({
        ...options,
        actors: [author],
      });
    } else if (!_.some(notify.actors, item => item.equals(author))) {
      notify.actors.unshift(author);
      notify = await notify.save();
    }
    pubsub.publish(NOTIFICATION_ADDED_SUBSCRIPTION, { notificationAdded: notify });
  });
}

async function sendJoinEventNotification(author, userJoin, eventId, type) {
  const options = {
    user: author,
    subject: eventId,
    seen: false,
    type,
  };

  let notify = await NotificationsModel.findOne(options);

  if (!notify) {
    notify = await NotificationsModel.create({
      ...options,
      actors: [userJoin],
    });
  } else if (!_.some(notify.actors, item => item.equals(userJoin))) {
    notify.actors.unshift(userJoin);
    notify = await notify.save();
  }
  pubsub.publish(NOTIFICATION_ADDED_SUBSCRIPTION, { notificationAdded: notify });
}

async function sendAcceptFriendNotification(userIDA, userIDR) {
  const r = await NotificationsModel.create({
    user: userIDR,
    actors: [userIDA],
    type: ACCEPTED_FRIEND,
  });
  pubsub.publish(NOTIFICATION_ADDED_SUBSCRIPTION, { notificationAdded: r });
  return r;
}

async function sendFriendRequestNotification(userIDA, userIDR) {
  const r = await NotificationsModel.create({
    user: userIDR,
    actors: [userIDA],
    type: FRIEND_REQUEST,
  });
  pubsub.publish(NOTIFICATION_ADDED_SUBSCRIPTION, { notificationAdded: r });
  return r;
}

async function sendDeletedEventNotification(usersid, eventId, actor) {
  usersid.forEach(async (id) => {
    const options = {
      user: id,
      subject: eventId,
      seen: false,
      type: EVENT_DELETED,
    };

    let notify = await NotificationsModel.findOne(options);

    if (!notify) {
      notify = await NotificationsModel.create({
        ...options,
        actors: [actor],
      });
    } else if (!_.some(notify.actors, item => item.equals(actor))) {
      notify.actors.unshift(actor);
      notify = await notify.save();
    }
    pubsub.publish(NOTIFICATION_ADDED_SUBSCRIPTION, { notificationAdded: notify });
  });
}

async function sendCancelledEventNotification(usersid, eventId, actor) {
  usersid.forEach(async (id) => {
    const options = {
      user: id,
      subject: eventId,
      seen: false,
      type: EVENT_CANCELLED,
    };

    let notify = await NotificationsModel.findOne(options);

    if (!notify) {
      notify = await NotificationsModel.create({
        ...options,
        actors: [actor],
      });
    } else if (!_.some(notify.actors, item => item.equals(actor))) {
      notify.actors.unshift(actor);
      notify = await notify.save();
    }
    pubsub.publish(NOTIFICATION_ADDED_SUBSCRIPTION, { notificationAdded: notify });
  });
}

async function acceptedUserBelongsToBuildingNotification(sender, receivers) {
  if (!_.isArray(receivers)) {
    return;
  }
  receivers.map(async (receiver) => {
    const r = await NotificationsModel.create({
      user: receiver,
      actors: [sender],
      type: ACCEPTED_JOIN_BUILDING,
    });
    pubsub.publish(NOTIFICATION_ADDED_SUBSCRIPTION, { notificationAdded: r });
  });
}

async function rejectedUserBelongsToBuildingNotification(sender, receivers) {
  if (!_.isArray(receivers)) {
    return;
  }
  receivers.map(async (receiver) => {
    const r = await NotificationsModel.create({
      user: receiver,
      actors: [sender],
      type: REJECTED_JOIN_BUILDING,
    });
    pubsub.publish(NOTIFICATION_ADDED_SUBSCRIPTION, { notificationAdded: r });
  });
}

async function sendSharingPostNotification(sender, receiver, postId) {
  // FIXME: check args
  if (!await UsersModel.findOne({ _id: sender })) {
    return;
  }
  if (!await UsersModel.findOne({ _id: receiver })) {
    return;
  }
  const r = await NotificationsModel.create({
    user: receiver,
    actors: [sender],
    type: SHARING_POST,
    subject: postId,
  });
  pubsub.publish(NOTIFICATION_ADDED_SUBSCRIPTION, { notificationAdded: r });
}

async function sendInterestEventNotification(author, userJoin, eventId) {
  const options = {
    user: author,
    subject: eventId,
    seen: false,
    type: INTEREST_EVENT,
  };

  let notify = await NotificationsModel.findOne(options);

  if (!notify) {
    notify = await NotificationsModel.create({
      ...options,
      actors: [userJoin],
    });
  } else if (!_.some(notify.actors, item => item.equals(userJoin))) {
    notify.actors.unshift(userJoin);
    notify = await notify.save();
  }
  pubsub.publish(NOTIFICATION_ADDED_SUBSCRIPTION, { notificationAdded: notify });
}

async function sendDisInterestEventNotification(author, userJoin, eventId) {
  const options = {
    user: author,
    subject: eventId,
    seen: false,
    type: DISINTEREST_EVENT,
  };

  let notify = await NotificationsModel.findOne(options);

  if (!notify) {
    notify = await NotificationsModel.create({
      ...options,
      actors: [userJoin],
    });
  } else if (!_.some(notify.actors, item => item.equals(userJoin))) {
    notify.actors.unshift(userJoin);
    notify = await notify.save();
  }
  pubsub.publish(NOTIFICATION_ADDED_SUBSCRIPTION, { notificationAdded: notify });
}

async function sendNewFeeForApartmentNotification(data) {
  const apartment = await ApartmentsModel.findOne({ _id: data.apartment });

  const options = {
    user: apartment.owner,
    seen: false,
    type: NEW_FEE_APARTMENT,
    'data.month': data.month,
    'data.year': data.year,
    'data.apartment': data.apartment,
  };
  const notify = await NotificationsModel.findOne(options);

  if (!notify) {
    const r = await NotificationsModel.create({
      user: apartment.owner,
      seen: false,
      type: NEW_FEE_APARTMENT,
      data,
    });
    pubsub.publish(NOTIFICATION_ADDED_SUBSCRIPTION, { notificationAdded: r });
  }
}

async function sendRemindFeeNotification(data) {
  const apartment = await ApartmentsModel.findOne({ _id: data.apartment });

  const r = await NotificationsModel.create({
    user: apartment.owner,
    seen: false,
    type: REMIND_FEE,
    data,
  });
  pubsub.publish(NOTIFICATION_ADDED_SUBSCRIPTION, { notificationAdded: r });
}

async function sendNewAnnouncementNotification(users, announcementID) {
  const notifications = users.map(user => ({
    user,
    type: NEW_ANNOUNCEMENT,
    data: {
      announcement: announcementID,
    },
    createdAt: new Date(),
  }));
  if (notifications.length > 0) {
    await NotificationsModel.collection.insert(notifications);
  }
}


export {
  sendLikeNotification,
  sendCommentNotification,
  sendPostNotification,
  sendAcceptFriendNotification,
  sendFriendRequestNotification,
  sendEventInviteNotification,
  sendJoinEventNotification,
  sendDeletedEventNotification,
  sendCancelledEventNotification,
  acceptedUserBelongsToBuildingNotification,
  rejectedUserBelongsToBuildingNotification,
  sendSharingPostNotification,
  sendInterestEventNotification,
  sendDisInterestEventNotification,
  sendNewFeeForApartmentNotification,
  sendNewAnnouncementNotification,
  sendRemindFeeNotification,
};
