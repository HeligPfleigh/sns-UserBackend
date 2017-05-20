import {
  PostsModel,
} from '../models';

function getPost (postId) {
  return PostsModel.findOne({_id: postId});
}

function feed () {
  console.log('not implement yet');
  return [];
}

export default {
  getPost,
  feed,
};
