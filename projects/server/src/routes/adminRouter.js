const router = require("express").Router();
const multer = require("multer");
const { product: productController } = require("../controllers");
const { admin: adminController } = require("../controllers");
const categorymulterMiddleware = require("../middleware/multerMiddleware/category");
const productmulterMiddleware = require("../middleware/multerMiddleware/product");
const validatorMiddleware = require("../middleware/validatorMiddleware");
const amdinMiddleware = require("../middleware/authMiddleware")
// const upload = multer({ fileFilter: fileFilter });
const promoValidator = require("../middleware/validatorMiddleware");

// create category // masih bisa handle wrong file format, blm bisa size
router.post(
  "/category",
  categorymulterMiddleware.single("file"),
  function (req, res, next) {
    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }
    next();
  },
  validatorMiddleware.createCategory,
  productController.createCategory
);
// get category
router.get("/categories", productController.allCategory);
// get category
router.get(
  "/no-pagination-categories",
  productController.allCategoryNoPagination
);
router.get("/categories/:id", productController.oneCategoryById);
//modify / remove category
router.patch(
  "/categories/:id/:action",
  categorymulterMiddleware.single("file"),
  validatorMiddleware.updateCategory,
  productController.modifyOrRemoveCategory
);
// create product
router.post(
  "/product",
  productmulterMiddleware.single("file"),
  validatorMiddleware.createProduct,
  productController.createProduct
);
// modify / remove product
router.patch(
  "/products/:id/:action",
  productmulterMiddleware.single("file"),
  validatorMiddleware.updateProduct,
  productController.modifyOrRemoveProduct
);
// get product
router.get("/products", productController.allProduct);
router.get("/no-pagination-products", productController.allProductNoPagination);
// get one product
router.get("/products/:id", productController.oneProductById);

// get all branch
router.get("/branch", amdinMiddleware.verifyToken, amdinMiddleware.verifySuperAdmin, adminController.allBranch)
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
