import { FeeTypeModel } from '../data/models/FeeModel';


const feeTypes = [
  {
    code: 1,
    name: 'Phí Điện',
  }, {
    code: 2,
    name: 'Phí Nước',
  }, {
    code: 3,
    name: 'Phí dịch vụ',
  }, {
    code: 4,
    name: 'Phí gửi xe',
  }, {
    code: 5,
    name: 'Phí nước',
  },
];

const initFeeTypes = () => {
  FeeTypeModel.create(feeTypes, () => {
  });
};

export {
  initFeeTypes,
};
