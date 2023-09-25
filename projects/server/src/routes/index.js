const auth = require("./authRouter");
const user = require("./userRouter");
const admin = require("./adminRouter");

module.exports = {
  auth,
  user,
  admin,
};
