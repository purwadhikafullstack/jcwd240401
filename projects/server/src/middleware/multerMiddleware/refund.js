const multer = require("multer");
const { join } = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, "..", "..", "Public", "refund"));
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
      cb(null, true);
      break;
    default:
      req.fileValidationError = "File format is not matched";
      cb(
        new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file format"),
        false
      );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1000 * 1000 },
});

module.exports = handleRefundImgUpload = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).send({ error: "File size exceeded the limit" });
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
          res.status(400).send({ error: "Invalid file format" });
        }
      }
    } else {
      next();
    }
  });
};