const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `./src/Public/category`);
  },
  filename: (req, file, cb) => {
    const fileName = `IMG-${Date.now()}${Math.round(
      Math.random() * 10000000
    )}.${file.mimetype.split("/")[1]}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file) {
    cb(null, true);
    return;
  }
  const mimeType = file.mimetype;
  switch (mimeType) {
    case "image/jpeg":
    case "image/jpg":
    case "image/png":
      if (file.size > 1 * 1000 * 1000) {
        req.fileValidationError.error = "File size exceeds 1MB";
        cb(null, false);
      } else {
        cb(null, true);
      }
      break;
    default:
      req.fileValidationError = "File format is not matched";
      cb(null, false);
  }
};

module.exports = multer({ storage, fileFilter });
