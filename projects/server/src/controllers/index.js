const auth = require("./authController");
const product = require("./productController");
const admin = require("./adminController");
const user = require("./userController");
const coordinate = require("./coordinateController");
const transaction = require("./transactionController");

module.exports = {
  auth,
  product,
  admin,
  user,
  coordinate,
  transaction,
};
