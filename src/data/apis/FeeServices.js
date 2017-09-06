
import mongoose from 'mongoose';
import { PAID, UNPAID, NEW_FEE_APARTMENT, NOTIFY_TYPES } from '../../constants';

import {
  FeeTypeModel,
  FeeModel,
} from '../models/FeeModel';

import {
  sendNewFeeForApartmentNotification,
} from '../../utils/notifications';

import {
  BuildingsModel,
  ApartmentsModel,
} from '../models';

async function saveFeeForApartments(datas, buildingId, feeType) {
  const type = await FeeTypeModel.findOne({ code: feeType });
  const apartmentNames = datas.map(data => data.apartment_number);
  const apartments = await ApartmentsModel.find({ building: buildingId, name: { $in: apartmentNames } });
  const apartmentGroupByNumber = {};
  apartments.forEach((apartment) => {
    if (!apartmentGroupByNumber[apartment.name.toString()]) {
      apartmentGroupByNumber[apartment.name.toString()] = apartment;
    }
  });
  const fees = datas.map(data => ({
    apartment: apartmentGroupByNumber[data.apartment_number.toString()]._id,
    building: buildingId,
    type: {
      code: type.code,
      name: type.name,
      icon: type.icon,
    },
    total: data.total,
    status: data.paid ? PAID : UNPAID,
    month: data.time.month,
    year: data.time.year,
    from: new Date(data.time.year, data.time.month - 1, 1, 0, 0, 0, 0),
    to: new Date(data.time.year, data.time.month, 0, 23, 59, 59, 999),
    deadline: data.deadline,
  }));

  const feesSaved = [];
  await Promise.all(fees.map(async (fee) => {
    const feeSaved = await FeeModel.findOneAndUpdate({
      apartment: fee.apartment,
      month: fee.month,
      year: fee.year,
      'type.code': fee.type.code,
    }, fee, { upsert: true });
    feesSaved.push(feeSaved);
    sendNewFeeForApartmentNotification({
      apartment: fee.apartment,
      month: fee.month,
      year: fee.year,
      text: `Thông báo nộp tiền ${fee.type.name.toString().toLowerCase()} tháng ${fee.month}/${fee.year}`,
    });
  }));
  console.log(feesSaved);
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
