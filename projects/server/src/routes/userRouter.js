const router = require("express").Router();
const {
  user: userController,
  product: productController,
} = require("../controllers");
const userMiddleware = require("../middleware/authMiddleware");

router.get("/profile", userController.getProfileWithVerificationToken);
router.get("/address", userMiddleware.verifyToken, userController.getAddress);
router.get("/branch-products", productController.productsFromNearestBranch);
router.post(
  "/profile/address",
  userMiddleware.verifyToken,
  userController.createAddress
);

module.exports = router;
