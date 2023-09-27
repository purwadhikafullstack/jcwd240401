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
const paymentMulterMiddleware = require("../middleware/multerMiddleware/payment");

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
router.delete(
  "/empty-cart",
  authMiddleware.verifyToken,
  authMiddleware.verifyUser,
  transactionController.emptyCart
);
router.post(
  "/shipping-cost",
  authMiddleware.verifyToken,
  authMiddleware.verifyUser,
  transactionController.getCost
);
router.post(
  "/checkout",
  authMiddleware.verifyToken,
  authMiddleware.verifyUser,
  transactionController.checkout
);
router.patch(
  "/orders/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyUser,
  transactionController.cancelOrder
);
router.get(
  "/vouchers/:grandTotal",
  authMiddleware.verifyToken,
  authMiddleware.verifyUser,
  transactionController.getUserVoucher
);
router.get(
  "/order/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyUser,
  transactionController.userOrderById
);
router.get(
  "/orders",
  authMiddleware.verifyToken,
  authMiddleware.verifyUser,
  userController.getOrderList
);
router.patch(
  "/payment/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyUser,
  paymentMulterMiddleware,
  transactionController.updatePayment
);
router.patch(
  "/confirm-order/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyUser,
  transactionController.confirmOrder
);
router.get(
  "/unavailable-cart",
  authMiddleware.verifyToken,
  authMiddleware.verifyUser,
  transactionController.getUnavailableCart
);
router.delete(
  "/unavailable-carts/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyUser,
  transactionController.deleteCartById
);

module.exports = router;
