const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const uploadPath = path.resolve(__dirname, '../../../tmp/awards');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const extension = path.extname(file.originalname);
    const storedFileName = `${uniqueSuffix}${extension}`;
    const originalFileName = file.originalname;
    const mimeType = file.mimetype;

    const fileData = {
      storedFileName,
      originalFileName,
      mimeType,
      path: `/tmp/awards/${storedFileName}`,
    };

    req.imageUrl = fileData;

    cb(null, storedFileName);
  },
});

const upload = multer({
  storage,
});
module.exports = upload;
