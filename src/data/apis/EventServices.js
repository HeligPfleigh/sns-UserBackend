import {
  PostsModel,
} from '../models';

import {
  sendEventInviteNotification,
  sendJoinEventNotification,
  sendInterestEventNotification,
} from '../../utils/notifications';
import { EVENT, EVENT_INVITE, JOIN_EVENT, CAN_JOIN_EVENT, CANT_JOIN_EVENT } from '../../constants';

async function createEvent({ privacy, author, photos, name, location, start, end, message, invites, building }) {
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
    building,
  });
  return event;
}

async function getEvent(postId) {
  const event = await PostsModel.findOne({ _id: postId });
  return event;
}

async function invitesResidentJoinEvent(eventId, residents) {
  const event = await PostsModel.findOneAndUpdate({ _id: eventId }, { $set: { invites: residents } }, { new: true });
  sendEventInviteNotification(event.author, eventId, residents, EVENT_INVITE);
  return event;
}

async function joinEvent(userId, eventId) {
  const event = await PostsModel.findOneAndUpdate({
    _id: eventId,
  }, {
    $pull: {
      invites: userId,
      can_joins: userId,
      cant_joins: userId,
    },
    $addToSet: {
      joins: userId,
    },
  }, {
    new: true,
  });
  sendJoinEventNotification(event.author, userId, eventId, JOIN_EVENT);
  return event;
}

async function canJoinEvent(userId, eventId) {
  const event = await PostsModel.findOneAndUpdate({
    _id: eventId,
  }, {
    $pull: {
      invites: userId,
      joins: userId,
      cant_joins: userId,
    },
    $addToSet: {
      can_joins: userId,
    },
  }, {
    new: true,
  });
  sendJoinEventNotification(event.author, userId, eventId, CAN_JOIN_EVENT);
  return event;
}

async function cantJoinEvent(userId, eventId) {
  const event = await PostsModel.findOneAndUpdate({
    _id: eventId,
  }, {
    $pull: {
      invites: userId,
      can_joins: userId,
      joins: userId,
    },
    $addToSet: {
      cant_joins: userId,
    },
  }, {
    new: true,
  });
  sendJoinEventNotification(event.author, userId, eventId, CANT_JOIN_EVENT);
  return event;
}

async function interestEvent(userId, eventId) {
  const event = await PostsModel.findOneAndUpdate({
    _id: eventId,
  }, {
    $addToSet: {
      interests: userId,
    },
  }, {
    new: true,
  });
  sendInterestEventNotification(event.author, userId, eventId);
  return event;
}

async function editEvent(_id, {
  privacy,
  photos,
  name,
  location,
  start,
  end,
  message,
  invites,
}) {
  const r = await PostsModel.findOneAndUpdate(
    {
      _id,
    },
    {
      $set: {
        privacy,
        photos,
        name,
        location,
        start,
        end,
        message,
        invites,
      },
    },
    {
      new: true,
    },
  );

  return r;
}


export default {
  createEvent,
  getEvent,
  invitesResidentJoinEvent,
  joinEvent,
  canJoinEvent,
  cantJoinEvent,
  interestEvent,
  editEvent,
};
