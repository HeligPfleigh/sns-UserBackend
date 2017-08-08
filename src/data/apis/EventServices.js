import {
  PostsModel,
} from '../models';

import {
  sendEventInviteNotification,
} from '../../utils/notifications';
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

async function invitesResidentJoinEvent(eventId, residents) {
  const event = await PostsModel.findOneAndUpdate({ _id: eventId }, { $set: { invites: residents } }, { new: true });
  sendEventInviteNotification(event.author, eventId, residents);
  return event;
}

export default {
  createEvent,
  createEventOnBuilding,
  getEvent,
  invitesResidentJoinEvent,
};
