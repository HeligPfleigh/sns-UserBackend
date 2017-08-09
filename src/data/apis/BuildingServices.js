import {
  BuildingsModel,
  ApartmentsModel,
} from '../models';
import Mailer from '../../core/mailer';
import config from '../../config';

const PAGE_SIZE = 5;

async function getBuildingWithApartments(page, q) {
  const buildings = await BuildingsModel.find({ search: new RegExp(q, 'i') }).limit(PAGE_SIZE).skip((page - 1) * 5);
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

async function notifywhenApprovedForUserBelongsToBuilding(email, data) {
  await Mailer.sendMail({
    to: email,
    subject: `SNS-SERVICE: Xác nhận đăng ký làm thành viên tòa nhà ${data.building.name}`,
    template: 'approvedForUserBelongsToBuilding',
    lang: 'vi-vn',
    data: Object.assign(data, {
      email,
      host: config.client,
    }),
  });
}

async function notifywhenRejectedForUserBelongsToBuilding(email, data) {
  await Mailer.sendMail({
    to: email,
    subject: `SNS-SERVICE: Từ chối đăng ký làm thành viên tòa nhà ${data.building.name}`,
    template: 'rejectedForUserBelongsToBuilding',
    lang: 'vi-vn',
    data: Object.assign(data, {
      email,
      host: config.client,
    }),
  });
}

export default {
  getBuildingWithApartments,
  notifywhenApprovedForUserBelongsToBuilding,
  notifywhenRejectedForUserBelongsToBuilding,
};
