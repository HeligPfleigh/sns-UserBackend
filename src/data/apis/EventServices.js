import {
  EventModel,
} from '../models';

async function createEvent(privacy, author, building, banner, name, location, start, end, description, invites) {
  const event = await EventModel.create({
    privacy,
    author,
    building,
    banner,
    name,
    location,
    start,
    end,
    invites,
  });
  return event;
}

export default {
  createEvent,
};
