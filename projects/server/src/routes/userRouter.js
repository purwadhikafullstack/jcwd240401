const router = require("express").Router();
const {
  user: userController,
  product: productController,
  coordinate: coordinateController,
  transaction: transactionController,
} = require("../controllers");
const authMiddleware = require("../middleware/authMiddleware");
const openCageMiddleware = require("../middleware/openCageMiddleware");
const validatorMiddleware = require("../middleware/validatorMiddleware");
const profileMulterMiddleware = require("../middleware/multerMiddleware/profile");

router.get("/branch-products", productController.productsFromNearestBranch);
router.get("/promoted-products", productController.promotedProducts);
router.get(
  "/branch-products/:branchId/:name/:weight/:unitOfMeasurement",
  userController.branchProductByName
);
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
router.get("/profile", userController.getProfile);
router.patch(
  "/profile/credential",
  validatorMiddleware.validateChangeCredential,
  userController.modifyCredential
);
router.patch(
  "/profile/image-profile",
  profileMulterMiddleware,
  userController.modifyImgProfile
);
router.post(
  "/carts/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyUser,
  transactionController.addToCart
);
router.get(
  "/carts",
  authMiddleware.verifyToken,
  authMiddleware.verifyUser,
  transactionController.getCart
);

router.delete(
  "/carts/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyUser,
  transactionController.removeFromCart
);

router.delete(
  "/carts",
  authMiddleware.verifyToken,
  authMiddleware.verifyUser,
  transactionController.deleteCart
);

module.exports = router;
