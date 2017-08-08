import reject from 'lodash/reject';
import uniq from 'lodash/uniq';
import map from 'lodash/map';
import uniqWith from 'lodash/uniqWith';
import union from 'lodash/union';
import isEqual from 'lodash/isEqual';
import some from 'lodash/some';
import {
  NotificationsModel,
  CommentsModel,
  PostsModel,
} from '../data/models';
import {
  LIKES,
  COMMENTS,
  NEW_POST,
  ACCEPTED_FRIEND,
  FRIEND_REQUEST,
  EVENT_INVITE,
  JOIN_EVENT,
  EVENT_DELETED,
} from '../constants';

const getUserFollow = async (postId, userId, status) => {
  const post = await PostsModel.findById(postId).select('likes user author');
  const comments = await CommentsModel.find({ post: postId }).select('user');

  const userLikes = post.likes;
  const userComment = uniq(map(comments, 'user'));
  let list = uniqWith(union([post.user], [post.author], userLikes, userComment), isEqual);
  list = reject(list, item => item.equals(userId));

  list.forEach(async (userFollow) => {
    const options = {
      user: userFollow,
      subject: postId,
      seen: false,
      type: status,
    };

    const notify = await NotificationsModel.findOne(options);

    if (!notify) {
      await NotificationsModel.create({
        ...options,
        actors: [userId],
      });
    } else if (!some(notify.actors, item => item.equals(userId))) {
      notify.actors.unshift(userId);
      await notify.save();
    }
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

    const notify = await NotificationsModel.findOne(options);

    if (!notify) {
      await NotificationsModel.create({
        ...options,
        actors: [author],
      });
    } else if (!some(notify.actors, item => item.equals(author))) {
      notify.actors.unshift(author);
      await notify.save();
    }
  });
}

async function sendJoinEventNotification(author, userJoin, eventId, type) {
  const options = {
    user: author,
    subject: eventId,
    seen: false,
    type,
  };

  const notify = await NotificationsModel.findOne(options);

  if (!notify) {
    await NotificationsModel.create({
      ...options,
      actors: [userJoin],
    });
  } else if (!some(notify.actors, item => item.equals(userJoin))) {
    notify.actors.unshift(userJoin);
    await notify.save();
  }
}

async function sendAcceptFriendNotification(userIDA, userIDR) {
  const r = await NotificationsModel.create({
    user: userIDR,
    actors: [userIDA],
    type: ACCEPTED_FRIEND,
  });
  return r;
}

async function sendFriendRequestNotification(userIDA, userIDR) {
  const r = await NotificationsModel.create({
    user: userIDR,
    actors: [userIDA],
    type: FRIEND_REQUEST,
  });
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

    const notify = await NotificationsModel.findOne(options);

    if (!notify) {
      await NotificationsModel.create({
        ...options,
        actors: [actor],
      });
    } else if (!some(notify.actors, item => item.equals(actor))) {
      notify.actors.unshift(actor);
      await notify.save();
    }
  });
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
};
