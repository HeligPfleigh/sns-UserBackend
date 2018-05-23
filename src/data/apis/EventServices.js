/* eslint-disable no-return-await */

import { ContentState, convertToRaw } from 'draft-js';
import { PostsModel } from '../models';

import {
  sendEventInviteNotification,
  sendJoinEventNotification,
  sendInterestEventNotification,
  sendDisInterestEventNotification,
} from '../../utils/notifications';
import { EVENT, EVENT_INVITE, JOIN_EVENT, CAN_JOIN_EVENT, CANT_JOIN_EVENT } from '../../constants';

async function createEvent({ message, isMobile = false, ...data }) {
  if (isMobile) {
    const content = ContentState.createFromText(message);
    message = JSON.stringify(convertToRaw(content));
  }
  return await PostsModel.create({ ...data, message, type: EVENT, isCancelled: false });
}

async function editEvent(_id, { message, building, isMobile = false, ...data }) {
  // @TODO: You should be re-factory this feature
  // when system contains feature add friend between different building
  if (building) {
    // console.log(building);
  }

  if (isMobile) {
    const content = ContentState.createFromText(message);
    message = JSON.stringify(convertToRaw(content));
  }

  return await PostsModel.findOneAndUpdate({ _id }, { $set: { ...data, message, building } }, { new: true });
}

async function getEvent(postId) {
  return await PostsModel.findOne({ _id: postId });
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

  if (event.author !== userId) {
    sendJoinEventNotification(event.author, userId, eventId, JOIN_EVENT);
  }

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

  if (event.author !== userId) {
    sendJoinEventNotification(event.author, userId, eventId, CAN_JOIN_EVENT);
  }
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

  if (event.author !== userId) {
    sendJoinEventNotification(event.author, userId, eventId, CANT_JOIN_EVENT);
  }
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

  if (event.author !== userId) {
    sendInterestEventNotification(event.author, userId, eventId);
  }

  return event;
}

async function disInterestEvent(userId, eventId) {
  const event = await PostsModel.findOneAndUpdate({
    _id: eventId,
  }, {
    $pull: {
      interests: userId,
    },
  }, {
    new: true,
  });

  if (event.author !== userId) {
    sendDisInterestEventNotification(event.author, userId, eventId);
  }
  return event;
}

export default {
  createEvent,
  editEvent,
  getEvent,
  joinEvent,
  canJoinEvent,
  cantJoinEvent,
  interestEvent,
  disInterestEvent,
  invitesResidentJoinEvent,
};
