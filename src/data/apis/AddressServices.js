import {
  BuildingsModel,
  ApartmentsModel,
} from '../models';

function getBuilding(buildingId) {
  return BuildingsModel.findOne({ _id: buildingId });
}

function getApartment(apartmentId) {
  return ApartmentsModel.findOne({ _id: apartmentId });
}

export default {
  getBuilding,
  getApartment,
};