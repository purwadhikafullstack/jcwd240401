const path = require("path");
module.exports = {
  setFromFileNameToDBValueProfile(filename) {
    return `/src/Public/profile/${filename}`;
  },
  setFromFileNameToDBValueProduct(filename) {
    return `/src/Public/product/${filename}`;
  },
  setFromFileNameToDBValueCategory(filename) {
    return `/src/Public/category/${filename}`;
  },
  setFromFileNameToDBValuePayment(filename) {
    return `/src/Public/payment/${filename}`;
  },
  setFromFileNameToDBValueRefund(filename) {
    return `/src/Public/refund/${filename}`;
  },
  getAbsolutePathPublicFileProfile(filename) {
    return path.join(__dirname, "..", "Public", "profile", filename);
  },
  getAbsolutePathPublicFileProduct(filename) {
    return path.join(__dirname, "..", "Public", "product", filename);
  },
  getAbsolutePathPublicFileCategory(filename) {
    return path.join(__dirname, "..", "Public", "category", filename);
  },
  getAbsolutePathPublicFilePayment(filename) {
    return path.join(__dirname, "..", "Public", "payment", filename);
  },
  getAbsolutePathPublicFileRefund(filename) {
    return path.join(__dirname, "..", "Public", "refund", filename);
  },
  convertFromDBtoRealPath(dbvalue) {
    return `${process.env.BASE_PATH}${dbvalue}`;
  },
  getFileNameFromDbValue(dbValue) {
    if (!dbValue || dbValue === "") {
      return "";
    }
    const split = dbValue.split("/");
    if (split.length < 5) {
      return "";
    }
    return split[4];
  },
};
