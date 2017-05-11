import createNewPost from './posts/createNewPost';
import createNewComment from './posts/createNewComment';
import likePost from './posts/likePost';
import unlikePost from './posts/unlikePost';
import acceptFriend from './friends/acceptFriend';
import rejectFriend from './friends/rejectFriend';
import friendAction from './friends/friendAction';
import sendFriendRequest from './users/sendFriendRequest';
import updateProfile from './users/updateProfile';
import { UpdateSeen, UpdateIsRead } from './notifications';

export default {
  updateProfile,
  createNewPost,
  createNewComment,
  likePost,
  unlikePost,
  acceptFriend,
  rejectFriend,
  sendFriendRequest,
  friendAction,
  UpdateSeen,
  UpdateIsRead,
};
