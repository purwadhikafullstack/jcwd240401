const auth = require("./authController");
const product = require("./productController");
const admin = require("./adminController");
const user = require("./userController")
const coordinate = require("./coordinateController")

module.exports = {
  auth,
  product,
  admin,
  user,
  coordinate
};
