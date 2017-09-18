import { convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import {
  BuildingsModel,
  ApartmentsModel,
  BuildingMembersModel,
} from '../models';
import Mailer from '../../core/mailer';
import config from '../../config';
import {
  ADMIN,
} from '../../constants/index';

// const PAGE_SIZE = 5;

async function searchBuildings(textSearch = 'v', limit = 5) {
  const buildings = await BuildingsModel.find({ search: new RegExp(textSearch, 'i') }).limit(limit);
  return buildings;
}

async function getBuildingWithApartments(page, q) {
  const buildings = await BuildingsModel.find({ search: new RegExp(q, 'i') }).limit(1);
  const buildingsResult = [];
  await Promise.all(buildings.map(async (building) => {
    const apartments = await ApartmentsModel.find({ building: building._id });
    const address = building.address.toObject();
    const display = `${building.name}-${address.ward}, ${address.district}, ${address.province}`;
    buildingsResult.push({
      _id: building._id,
      display,
      name: building.name,
      address: building.address,
      location: building.location,
      description: building.description,
      apartments,
    });
  }));
  return buildingsResult;
}

async function getBOMOfBuilding(buildingId) {
  const buildingMembers = await BuildingMembersModel.find({
    building: buildingId,
    type: ADMIN,
  }).populate('user');

  return buildingMembers.map(member => member.user);
}

async function notifywhenAcceptedForUserBelongsToBuilding(email, data) {
  await Mailer.sendMail({
    to: email,
    subject: 'SNS-SERVICE: Xác nhận đăng ký làm thành viên tòa nhà',
    template: 'acceptedForUserBelongsToBuilding',
    lang: 'vi-vn',
    data: Object.assign(data, {
      email,
      host: config.client,
    }),
  });
}

async function notifywhenRejectedForUserBelongsToBuilding(email, data) {
  /*
   * Convert message Draft content to Html content
   */

  data.message = stateToHTML(convertFromRaw(JSON.parse(data.message)));

  await Mailer.sendMail({
    to: email,
    subject: 'SNS-SERVICE: Từ chối đăng ký làm thành viên tòa nhà',
    template: 'rejectedForUserBelongsToBuilding',
    lang: 'vi-vn',
    data: Object.assign(data, {
      email,
      host: config.client,
    }),
  });
}

export default {
  searchBuildings,
  getBuildingWithApartments,
  notifywhenAcceptedForUserBelongsToBuilding,
  notifywhenRejectedForUserBelongsToBuilding,
  getBOMOfBuilding,
};
