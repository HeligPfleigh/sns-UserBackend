import {
  BuildingsModel,
  ApartmentsModel,
} from '../models';

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

export default {
  getBuildingWithApartments,
};
