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

export default {
  createEvent,
  createEventOnBuilding,
};
