const router = require("express").Router();
const {
  user: userController,
  product: productController,
} = require("../controllers");
const authMiddleware = require("../middleware/authMiddleware");
const openCageMiddleware = require("../middleware/openCageMiddleware");
const validatorMiddleware = require("../middleware/validatorMiddleware");

router.use(authMiddleware.verifyToken, authMiddleware.verifyUser);
router.get("/main-address", userController.getMainAddress);
router.get("/addresses", userController.getAllAddress);
router.get("/branch-products", productController.productsFromNearestBranch);
router.post(
  "/address",
  validatorMiddleware.validateCreateAddress,
  openCageMiddleware.addressUserCoordinate,
  userController.createAddress
);
router.patch("/addresses/:id/:action", userController.setMainOrRemoveAddress);
router.get("/addresses/:name", userController.getAddressByName);
router.patch(
  "/addresses/:id",
  validatorMiddleware.validateModifyAddress,
  openCageMiddleware.addressUserCoordinate,
  userController.modifyAddress
);

module.exports = router;
