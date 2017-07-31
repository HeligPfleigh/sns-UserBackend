import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import { ObjectId } from 'mongodb';
import {
  UsersModel,
  PostsModel,
  BuildingFeedModel,
  FriendsRelationModel,
} from '../models';
import {
  sendPostNotification,
  sendLikeNotification,
} from '../../utils/notifications';
import { ACCEPTED } from '../../constants';

function getPost(postId) {
  return PostsModel.findOne({ _id: postId });
}

function feed() {
  console.log('not implement yet');
  return [];
}

async function likePost(userId, postId) {
  if (isUndefined(userId)) {
    throw new Error('userId is undefined');
  }
  if (isUndefined(postId)) {
    throw new Error('postId is undefined');
  }
  if (!await PostsModel.findOne({ _id: new ObjectId(postId) })) {
    throw new Error('postId does not exist');
  }
  if (!await UsersModel.findOne({ _id: new ObjectId(userId) })) {
    throw new Error('userId does not exist');
  }
  await PostsModel.update(
    { _id: postId },
    { $addToSet: { likes: userId } },
  );

  const p = await PostsModel.findOne({ _id: postId });
  p.isLiked = true;

  sendLikeNotification(postId, userId);
  return p;
}

async function unlikePost(userId, postId) {
  if (isUndefined(userId)) {
    throw new Error('userId is undefined');
  }
  if (isUndefined(postId)) {
    throw new Error('postId is undefined');
  }
  if (!await PostsModel.findOne({ _id: new ObjectId(postId) })) {
    throw new Error('postId does not exist');
  }
  if (!await UsersModel.findOne({ _id: new ObjectId(userId) })) {
    throw new Error('userId does not exist');
  }
  const result = await PostsModel.update(
    { _id: postId },
    { $pull: { likes: userId } },
  );
  if (result.nModified !== 1) {
    throw new Error('Update faild...');
  }
  return PostsModel.findOne({ _id: postId });
}
async function createNewPost(author, message, userId, privacy, photos) {
  try {
    if (isUndefined(author)) {
      throw new Error('author is undefined');
    }
    if (isUndefined(message)) {
      throw new Error('message is undefined');
    }
    if (!await UsersModel.findOne({ _id: new ObjectId(author) })) {
      throw new Error('author does not exist');
    }
    if (!photos) {
      photos = [];
    }
    if (userId && !await FriendsRelationModel.findOne({
      friend: author,
      user: userId,
      status: ACCEPTED,
    })) {
      throw new Error('You are not user friend');
    }
    // JSON.parse(message);
    const r = await PostsModel.create({
      message,
      author,
      user: userId || author,
      privacy,
      photos,
    });

    if (userId && !isEqual(userId, author)) {
      sendPostNotification(r._id, author);
    }
    r.isLiked = false;
    return r;
  } catch (e) {
    throw e;
  }
}

async function createNewPostOnBuilding(author, message, photos, buildingId) {
  try {
    if (isUndefined(author)) {
      throw new Error('author is undefined');
    }
    if (isUndefined(message)) {
      throw new Error('message is undefined');
    }
    if (!await UsersModel.findOne({ _id: new ObjectId(author) })) {
      throw new Error('author does not exist');
    }
    // JSON.parse(message);
    const r = await PostsModel.create({
      message,
      author,
      building: buildingId,
      photos,
    });

    await BuildingFeedModel.create({ building: buildingId, post: r._id });

    r.isLiked = false;
    return r;
  } catch (e) {
    throw e;
  }
}

export default {
  getPost,
  feed,
  likePost,
  unlikePost,
  createNewPost,
  createNewPostOnBuilding,
};
