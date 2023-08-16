const router = require("express").Router();
const productController = require("../controllers/productController");
const { admin: adminController } = require("../controllers");
const multerMiddleware = require("../middleware/multerMiddleware/category");
const promoValidator = require("../middleware/validatorMiddleware");

// create category
router.post(
  "/category",
  multerMiddleware.single("file"),
  productController.createCategory
);
router.post(
  "/discounts",
  promoValidator.validateCreateDiscount,
  adminController.createDiscount
);
router.get("/discounts", adminController.getAllDiscount);
router.get("/discount-types", adminController.getAllDiscountType);
router.post(
  "/vouchers",
  promoValidator.validateCreateVoucher,
  adminController.createVoucher
);
router.get("/vouchers", adminController.getAllVoucher);
router.get("/voucher-types", adminController.getAllVoucherType);

module.exports = router;
