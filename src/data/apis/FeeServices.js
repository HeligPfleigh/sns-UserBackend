
import mongoose from 'mongoose';
import { PAID, UNPAID } from '../../constants';

import {
  FeeTypeModel,
  FeeModel,
} from '../models/FeeModel';

import {
  BuildingsModel,
  ApartmentsModel,
} from '../models';

async function saveFeeForApartments(datas, buildingId, feeType) {
  const type = await FeeTypeModel.findOne({ code: feeType });
  const apartments = await ApartmentsModel.find({ building: buildingId });
  const apartmentGroupByNumber = {};
  apartments.forEach((apartment) => {
    if (!apartmentGroupByNumber[apartment.number.toString()]) {
      apartmentGroupByNumber[apartment.number.toString()] = apartment;
    }
  });
  const fees = datas.map(data => ({
    apartment: apartmentGroupByNumber[data.apartment_number.toString()]._id,
    building: buildingId,
    type: {
      code: type.code,
      name: type.name,
    },
    total: data.total,
    status: data.paid ? PAID : UNPAID,
    month: data.time.month,
    year: data.time.year,
    from: new Date(data.time.year, data.time.month - 1, 1, 0, 0, 0, 0),
    to: new Date(data.time.year, data.time.month, 0, 23, 59, 59, 999),
  }));
  const feesSaved = [];
  await Promise.all(fees.map(async (fee) => {
    const feeSaved = await FeeModel.findOneAndUpdate({
      month: fee.month,
      year: fee.year,
      'type.code': type.code,
    }, fee, { upsert: true });
    feesSaved.push(feeSaved);
  }));

  return feesSaved;
}

async function getFeeTypes() {
  const types = await FeeTypeModel.find({ });
  return types;
}

export {
  saveFeeForApartments,
  getFeeTypes,
};

export default {
  saveFeeForApartments,
  getFeeTypes,
};
