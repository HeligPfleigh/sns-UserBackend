import ApartmentModel from '../models/ApartmentsModel';
import FeeModel from '../models/FeeModel';

async function getFeeOfApartment(filter) {
  const fees = await FeeModel.find(filter);
  return fees;
}

export default {
  getFeeOfApartment,
};
