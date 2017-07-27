import express from 'express';
import Constant from './constant';

const whiteListFileTypes = Constant.fileTypes;

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

export default router;
