import _ from 'lodash';
import {
  NotificationsModel,
  CommentsModel,
  PostsModel,
} from '../data/models';
import { NOTIFY_TYPES } from '../constants';

const getUserFollow = async (postId, userId, status) => {
  const post = await PostsModel.findById(postId).select('likes user');
  const comments = await CommentsModel.find({ post: postId }).select('user');

  const userLikes = post.likes;
  const userComment = _.uniq(_.map(comments, 'user'));
  let list = _.uniqWith(_.union([post.user], userLikes, userComment), _.isEqual);
  list = _.reject(list, item => item.equals(userId));

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
    } else if (!_.some(notify.actors, item => item.equals(userId))) {
      notify.actors.unshift(userId);
      await notify.save();
    }
  });
  return null;
};

function sendLikeNotification(postId, userId) {
  getUserFollow(postId, userId, NOTIFY_TYPES[0]);
}

function sendCommentNotification(postId, userId) {
  getUserFollow(postId, userId, NOTIFY_TYPES[1]);
}

function sendPostNotification(postId, userId) {
  getUserFollow(postId, userId, NOTIFY_TYPES[2]);
}

export {
  sendLikeNotification,
  sendCommentNotification,
  sendPostNotification,
};
