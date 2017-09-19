import express from 'express';
import path from 'path';
import isNumber from 'lodash/isNumber';
import forEach from 'lodash/forEach';
import isDate from 'lodash/isDate';
import Constant from './constant';
import ApartmentModel from '../../data/models/ApartmentsModel';
import BuildingSettingsService from '../../data/apis/BuildingSettingsService';

import {
  saveFeeForApartments,
} from '../../data/apis/FeeServices';
import {
  FeeTypeModel,
} from '../../data/models/FeeModel';

const moment = require('moment');

moment.locale('vi');

const xlstojson = require('xls-to-json-lc');
const xlsxtojson = require('xlsx-to-json-lc');

const multer = require('multer');


const whiteListFileTypes = Constant.fileTypes;

const storage = multer.diskStorage({ // multers disk storage settings
  destination(req, file, cb) {
    cb(null, `${__dirname}/public/documents/`);
  },
  filename(req, file, cb) {
    const datetimestamp = Date.now();
    cb(null, `${file.fieldname}-${datetimestamp}.${file.originalname.split('.')[file.originalname.split('.').length - 1]}`);
  },
});

const upload = multer({ // multer settings
  storage,
  fileFilter: (req, file, callback) => { // file filter
    if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
      return callback(new Error('Wrong extension type'));
    }
    return callback(null, true);
  },
}).single('file');

const Busboy = require('busboy');
const fs = require('fs');

const router = express.Router();

router.post('/image', (req, res) => {
  if (req.method === 'POST') {
    const busboy = new Busboy({ headers: req.headers });
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      if (whiteListFileTypes.indexOf(mimetype) >= 0) {
        const partOfFileName = filename.split('.');
        const originalFilename = `${Date.now().toString()}.${partOfFileName[partOfFileName.length - 1]}`;

        const pathUpload = `${__dirname}/public/uploads/${originalFilename}`;
        const imageFileStreamWrite = fs.createWriteStream(pathUpload);
        file.on('data', (data) => {
          imageFileStreamWrite.write(data);
        });

        file.on('end', () => {
          imageFileStreamWrite.end();
          res.json({
            url: `http://${req.headers.host}/images/${originalFilename}`,
          });
        });
      } else {
        file.on('data', () => {

        });

        file.on('end', () => {
          res.status(400).send('Bad request');
        });
      }
    });

    req.pipe(busboy);
  }
});


function validateData(data, { building, type }, callback) {
  if (data.length === 0) {
    callback(new Error('Tập tin tải lên không có dữ liệu.'));
    return;
  }

  const errors = {};
  const apartments = [];
  const deadlines = [];
  const resultValidated = data.map((item, idx) => {
    const key = (idx + 2).toString();
    errors[key] = [];

    const apartment = String(item['căn hộ']).trim();
    let total = String(item['số tiền']).trim();
    const datetime = String(item['thời gian']).trim().split('/');
    const deadline = moment(item['hạn nộp'], ['DD/MM/YYYY', 'DD/MM/YY', 'DD MMM YYYY']).toDate();
    let month = datetime[0];
    let year = datetime[1];

    // Validate datetime
    if (!(datetime.length === 2)) {
      errors[key].push('Thời gian đóng phí chưa được nhập.');
    } else {
      // Month
      month = parseInt(month, 10);
      const mLength = String(month).trim().length;
      if (!isNumber(month) || mLength < 1 || mLength > 2) {
        errors[key].push('Giá trị tháng trong cột thời gian không đúng.');
      }

      // Year
      year = parseInt(year, 10);
      if (!isNumber(year) || !(String(year).trim().length === 4)) {
        errors[key].push('Giá trị năm trong cột thời gian không đúng.');
      }
    }
    // validate deadline
    if (!isDate(deadline)) {
      errors[key].push('Sai định dạng ngày tháng');
    } else if (deadlines.indexOf(deadline) === -1) {
      // Store deadline into building settings.
      // From this setting, the app will automatically remind unfinished apartments to paid fee.
      deadlines.push(deadline);
    }

    // validate apartment
    if (apartment) {
      apartments.push({
        index: idx,
        number: apartment,
      });
    } else {
      errors[key].push('Tên căn hộ chưa được nhập.');
    }

    // validate total
    if (total) {
      total = parseFloat(total, 10);
      if (!isNumber(total)) {
        errors[key].push('Số tiền phí không đúng định dạng.');
      } else if (total < 0) {
        errors[key].push('Số tiền phí là số âm.');
      }
    } else {
      errors[key].push('Số tiền phí chưa được nhập');
    }

    return {
      paid: ['đã nộp', 'đã thanh toán', 'paid'].indexOf(item['đã thanh toán'].toLowerCase()) > -1,
      apartment_number: item['căn hộ'],
      total,
      fee: item['loại phí'],
      time: {
        month,
        year,
      },
      deadline,
    };
  });

  ApartmentModel.find({
    building,
  }, (err, apartmentsInBuilding) => {
    if (err || !apartmentsInBuilding || apartmentsInBuilding.length === 0) {
      callback(new Error('Tòa nhà này không có căn hộ nào.'));
    } else {
      const apartmentNumberInBuilding = apartmentsInBuilding.map(apart => apart.name);
      apartments.forEach((item) => {
        const key = (item.index + 2).toString();
        errors[key] = errors[key] || [];
        if (apartmentNumberInBuilding.indexOf(item.number) < 0) {
          errors[key].push(`Căn hộ ${item.number} không có trong tòa nhà.`);
        }
      });

      forEach(errors, (value, key) => {
        if (!value || value.length === 0) {
          delete errors[key];
        }
      });

      callback(errors, resultValidated, deadlines);
    }
  });
}

router.post('/document', (req, res) => {
  const building = req.query.building;
  const type = req.query.type;
  const save = req.query.import;

  // const feeType = await FeeTypeModel.findOne({ code: type });

  if (!building) {
    res.json({ error: true, message: 'Không xác định được tòa nhà để cập nhật phí.' });
    return;
  }
  upload(req, res, (err) => {
    if (err) {
      res.json({ error: true, message: 'Tập tin của bạn không được tải lên.' });
      return;
    }

    if (!req.file) {
      res.json({ error: true, message: 'Không có tệp tin nào được chọn.' });
      return;
    }

    let exceltojson;
    const ext = path.extname(req.file.originalname);

    if (ext.toLowerCase() === '.xlsx') {
      exceltojson = xlsxtojson;
    } else {
      exceltojson = xlstojson;
    }

    try {
      exceltojson({
        input: req.file.path, // the same path where we uploaded our file
        output: null, // since we don't need output.json
        lowerCaseHeaders: true,
      }, (errForParseExcel, result) => {
        if (errForParseExcel) {
          return res.json({ error: true, message: 'Không thể đọc được dữ liệu trong tập tin bạn tải lên.' });
        }

        return validateData(result, { building, type }, async (validationErrors, data, deadlines) => {
          validationErrors = Object.assign({}, validationErrors);
          let error = Object.keys(validationErrors).length > 0;
          let message = 'Không thể đọc được dữ liệu trong tập tin bạn tải lên.';
          if (!error && save) {
            try {
              data = await saveFeeForApartments(data, building, type);
              message = 'Bạn đã cập nhật phí cho tòa nhà thành công.';
              if (Array.isArray(deadlines)) {
                deadlines.forEach((deadline) => {
                  BuildingSettingsService.Model.findOneAndUpdate({
                    building,
                  }, {
                    $addToSet: {
                      feeNotifications: {
                        code: type,
                        deadline,
                      },
                    },
                  }, {
                    upsert: true,
                  });
                });
              }
            } catch (e) {
              error = true;
              message = 'Có lỗi xảy ra trong quá trình cập nhật phí cho tòa nhà.';
            }
          }

          await res.json({
            error,
            message,
            validationErrors,
            data,
          });
        });
      });
    } catch (e) {
      res.json({ error: true, message: e.message });
    }
  });
});

export default router;
