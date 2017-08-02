import {
  BuildingsModel,
  ApartmentsModel,
} from '../models';

async function getBuildingWithApartments(page) {
  const buildings = await BuildingsModel.find({}).limit(10).skip((page - 1) * 10);
  const buildingsResult = [];
  await Promise.all(buildings.map(async (building) => {
    const apartments = await ApartmentsModel.find({ building: building._id });
    building.apartments = [1, 2, 3];
    buildingsResult.push({
      _id: building._id,
      name: building.name,
      address: building.address,
      location: building.location,
      description: building.description,
      apartments,
    });
  }));
  return buildingsResult;
}

export default {
  getBuildingWithApartments,
};
