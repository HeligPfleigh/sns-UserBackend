import {
  UsersModel,
} from '../models';

function getUser (userId) {
  return UsersModel.findOne({_id: userId});
}

export default {
  getUser,

};
