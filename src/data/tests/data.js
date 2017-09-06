const buildingData = {
  // _id: buildingId,
  name: 'Vinhomes Riverside',
  parent: '5937b6dfd9f4f14764d072de',
  address: {
    basisPoint: 'Số 72',
    country: 'Việt Nam',
    province: 'Thành Phố Hà Nội',
    district: 'Quận Cầu Giấy',
    ward: 'Phường Nghĩa Đô',
    street: 'Đường Trần Đăng Ninh',
    countryCode: 'VN',
  },
  location: {
    coordinates: [
      105.7976544,
      21.0714764,
    ],
    type: 'Point',
  },
  description: 'Vingroup Joint Stock Company',
  isPublished: true,
  isDeleted: false,
  createdAt: '2017-06-10T11:02:26.266Z',
  updatedAt: '2017-08-01T03:36:45.099Z',
  __v: 0,
};

const apartmentData = {
  prefix: 'P',
  number: '27',
  name: 'name',
  createdAt: '2017-04-21T08:24:31.178Z',
  updatedAt: '2017-04-21T08:24:31.178Z',
  users: [],
  // owner: 
  // building: buildingId,
  isOwner: true,
  __v: 0,
};

export {
  buildingData, // eslint-disable-line import/prefer-default-export
  apartmentData,
};
