import map from 'lodash/map';
import {
  BuildingsModel,
  ApartmentsModel,
  BuildingMembersModel,
} from '../models';

function getBuilding(buildingId) {
  return BuildingsModel.findOne(
    { _id: buildingId },
  );
  // .select('-announcements');
}

async function getBuildings(userId) {
  const records = await BuildingMembersModel.find({ user: userId }).select('building');
  const buildingIds = map(records, 'building');
  return BuildingsModel.find({
    _id: { $in: buildingIds },
  });
  // .select('-announcements');
}

function getApartment(apartmentId) {
  return ApartmentsModel.findOne({ _id: apartmentId });
}

function getApartmentsOfBuilding(userId, buildingId) {
  const options = {
    building: buildingId,
  };

  if (userId) {
    options.$or = [
      { owner: userId },
      {
        users: {
          $in: [userId],
        },
      },
    ];
  }
  return ApartmentsModel.find(options).sort({ name: 1 });
}

export default {
  getBuilding,
  getBuildings,
  getApartment,
  getApartmentsOfBuilding,
};
