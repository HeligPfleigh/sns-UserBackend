import express from 'express';
import isEmpty from 'lodash/isEmpty';
import Constant from './constant';
import ApartmentModel from '../../data/models/ApartmentsModel';
import {
  saveFeeForApartments,
} from '../../data/apis/FeeServices';

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


function validateData(data, buildingId, callback) {
  if (data.length === 0) {
    callback(new Error('File rỗng'));
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

  ApartmentModel.find({
    building: buildingId,
  }, (err, apartmentsInBuilding) => {
    if (err || !apartmentsInBuilding || apartmentsInBuilding.length === 0) {
      callback(new Error('Tòa nhà này không có căn hộ nào'));
    } else {
      const apartmentNumberInBuilding = apartmentsInBuilding.map(apart => apart.name);
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
}

router.post('/document', (req, res) => {
  let exceltojson;

  const buildingId = req.query.building;
  const type = req.query.type;

  if (!buildingId) {
    res.json({
      error: false,
      err_desc: 'building_id not found',
    });
    return;
  }
  upload(req, res, (err) => {
    if (err) {
      res.json({ error: true, err_desc: err });
      return;
    }
    if (!req.file) {
      res.json({ error: true, err_desc: 'No file passed' });
      return;
    }
    if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
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
          return res.json({ error_code: 1, err_desc: err, data: null });
        }
        return validateData(result, buildingId, async (error, data) => {
          let hasError = null;
          if (!isEmpty(error)) {
            hasError = error;
          }
          if (!hasError && type) {
            const dataSaved = await saveFeeForApartments(data, buildingId, type);
            res.json({
              error: null,
              data: dataSaved,
            });
          } else {
            res.json({
              error: hasError,
              data,
            });
          }
        });
      });
    } catch (e) {
      res.json({ error_code: 1, err_desc: 'Corupted excel file' });
    }
  });
});

export default router;
