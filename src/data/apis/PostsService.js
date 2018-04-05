import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import { ObjectId } from 'mongodb';
import { ContentState, convertToRaw } from 'draft-js';
import {
  UsersModel,
  PostsModel,
  FriendsRelationModel,
} from '../models';
import {
  sendPostNotification,
  sendLikeNotification,
} from '../../utils/notifications';
import { ACCEPTED, POST_ADDED_SUBSCRIPTION } from '../../constants';
import { pubsub } from '../schema';

function getPost(postId) {
  return PostsModel.findOne({
    _id: postId,
    isDeleted: { $exists: false },
  });
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
async function createNewPost(author, message, userId, privacy, photos, isMobile = false) {
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
    if (!isEqual(userId, author) && !await FriendsRelationModel.findOne({
      friend: author,
      user: userId,
      status: ACCEPTED,
    })) {
      throw new Error('You are not user friend');
    }
    if (isMobile) {
      const content = ContentState.createFromText(message);
      message = JSON.stringify(convertToRaw(content));
    } else {
      try {
        JSON.parse(message);
      } catch (error) {
        throw new Error('Post message invalid');
      }
    }
    const r = await PostsModel.create({
      message,
      author,
      user: userId || author,
      privacy,
      photos,
    });

    // emit a subscription signal when create new post 
    pubsub.publish(POST_ADDED_SUBSCRIPTION, { postAdded: r });

    if (userId && !isEqual(userId, author)) {
      sendPostNotification(r._id, author);
    }
    r.isLiked = false;
    return r;
  } catch (e) {
    throw e;
  }
}

async function createNewPostOnBuilding(author, message, photos, buildingId, privacy) {
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
      privacy,
      photos,
    });

    r.isLiked = false;
    return r;
  } catch (e) {
    throw e;
  }
}

async function editPost(_id, message, photos, privacy, isDelPostSharing, isMobile) {
  const p = await PostsModel.findOne({ _id });
  if (!p) {
    throw new Error('not found the post');
  }
  if (isMobile) {
    const content = ContentState.createFromText(message);
    message = JSON.stringify(convertToRaw(content));
  } else {
    try {
      JSON.parse(message);
    } catch (error) {
      throw new Error('Post message invalid');
    }
  }
  await PostsModel.update({
    _id,
  }, {
    $set: {
      message,
      photos,
      privacy,
      sharing: isDelPostSharing ? p.sharing : null,
    },
  });
  return PostsModel.findOne({
    _id,
  });
}

export default {
  getPost,
  feed,
  editPost,
  likePost,
  unlikePost,
  createNewPost,
  createNewPostOnBuilding,
};
