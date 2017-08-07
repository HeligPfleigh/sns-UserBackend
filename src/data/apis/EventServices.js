import {
  PostsModel,
} from '../models';
import { EVENT } from '../../constants';

async function createEvent(privacy, author, photos, name, location, start, end, message, invites) {
  const event = await PostsModel.create({
    type: EVENT,
    privacy,
    author,
    photos,
    name,
    location,
    start,
    end,
    message,
    invites,
  });
  return event;
}

async function createEventOnBuilding(privacy, author, photos, building, name, location, start, end, message, invites) {
  const event = await PostsModel.create({
    type: EVENT,
    privacy,
    author,
    photos,
    building,
    name,
    location,
    start,
    end,
    message,
    invites,
  });
  return event;
}

function getEvent(postId) {
  return PostsModel.findOne({ _id: postId });
}

export default {
  createEvent,
  createEventOnBuilding,
  getEvent,
};
