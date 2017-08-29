import ApartmentsModel from '../data/models/ApartmentsModel';

const validateData = (data, buildingId, callback) => {
  if (data.length === 0) {
    callback(new Error('Không có dữ liệu'));
    return;
  }
  const rowsError = {};
  const apartments = [];
  const resultValidated = data.map((item, idx) => {
    const apartment = item['căn hộ'];
    const total = item['số tiền'];

    // validate apartment
    if (apartment) {
      apartments.push({
        index: idx,
        number: apartment,
      });
    } else if (rowsError[(idx + 2).toString()]) {
      rowsError[(idx + 2).toString()].errors.push('Căn hộ trống');
    } else {
      rowsError[(idx + 2).toString()] = {
        errors: ['Căn hộ trống'],
      };
    }

    // validate total
    if (total) {
      if (parseInt(total, 10) < 0) {
        if (rowsError[(idx + 2).toString()]) {
          rowsError[(idx + 2).toString()].errors.push('Số tiền âm');
        } else {
          rowsError[(idx + 2).toString()] = {
            errors: ['Số tiền âm'],
          };
        }
      }
    } else if (rowsError[(idx + 2).toString()]) {
      rowsError[(idx + 2).toString()].errors.push('Số tiền rỗng');
    } else {
      rowsError[(idx + 2).toString()] = {
        errors: ['Số tiền rỗng'],
      };
    }

    return {
      paid: item['đã thanh toán'] === 'OK',
      apartment_number: item['căn hộ'],
      total: parseInt(item['số tiền'], 10),
      time: {
        month: parseInt(item['thời gian'].split('/')[0], 10),
        year: parseInt(item['thời gian'].split('/')[1], 10),
      },
    };
  });

  ApartmentsModel.find({
    building: buildingId,
  }, (err, apartmentsInBuilding) => {
    if (err || !apartmentsInBuilding || apartmentsInBuilding.length === 0) {
      callback(new Error('Tòa nhà này không có căn hộ nào'));
    } else {
      const apartmentNumberInBuilding = apartmentsInBuilding.map(apart => apart.number);
      apartments.forEach((item) => {
        if (apartmentNumberInBuilding.indexOf(item.number) < 0) {
          if (rowsError[(item.index + 2).toString()]) {
            rowsError[(item.index + 2).toString()].errors.push(`Căn hộ ${item.number} không có trong tòa nhà`);
          } else {
            rowsError[(item.index + 2).toString()] = {
              errors: [`Căn hộ ${item.number} không có trong tòa nhà`],
            };
          }
        }
      });
      callback(rowsError, resultValidated);
    }
  });
};
export default validateData;
