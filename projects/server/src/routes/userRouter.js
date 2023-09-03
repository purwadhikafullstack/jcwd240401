const router = require("express").Router();
const {
  user: userController,
  product: productController,
  coordinate: coordinateController,
} = require("../controllers");
const authMiddleware = require("../middleware/authMiddleware");
const openCageMiddleware = require("../middleware/openCageMiddleware");
const validatorMiddleware = require("../middleware/validatorMiddleware");

router.get("/branch-products", productController.productsFromNearestBranch);
router.get("/promoted-products", productController.promotedProducts)
router.get("/branch-products/:name", userController.branchProductByName);
router.get("/location", coordinateController.coordinateToPlacename);
router.get(
  "/branchs/:id/categories",
  productController.allCategoryNoPaginationPerBranch
);

router.use(authMiddleware.verifyToken, authMiddleware.verifyUser);
router.get("/main-address", userController.getMainAddress);
router.get("/addresses", userController.getAllAddress);
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
