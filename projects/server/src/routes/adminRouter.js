const router = require("express").Router();
const multer = require("multer");
const { product: productController } = require("../controllers");
const { admin: adminController } = require("../controllers");
const categorymulterMiddleware = require("../middleware/multerMiddleware/category");
const productmulterMiddleware = require("../middleware/multerMiddleware/product");
const validatorMiddleware = require("../middleware/validatorMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
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
router.get(
  "/branch",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  adminController.allBranch
);

// create branch product
router.post(
  "/my-branch/branch-products",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.addBranchProduct
);
// modify / remove branch product
router.patch(
  "/my-branch/branch-products/:id/:action",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.modifyOrRemoveBranchProduct
);
// plus / minus branch product stock
router.patch(
  "/my-branch/branch-products/:id/stock/:action",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.plusOrMinusBranchProduct
);
// get all branch product
router.get(
  "/my-branch/branch-products",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.allBranchProduct
);
// get all branch product no pagination
router.get(
  "/my-branch/no-pagination-branch-products",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.allBranchProductNoPagination
);
// get branch product per Id
router.get(
  "/my-branch/branch-products/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.branchProductPerId
);
// get unadded products
router.get(
  "/my-branch/unadded-products",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  productController.allUnaddedProducts
);
//create discount
router.post(
  "/discounts",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  promoValidator.validateCreateDiscount,
  adminController.createDiscount
);
// get all discounts
router.get(
  "/discounts",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.getAllDiscount
);
//get all discount types
router.get(
  "/discount-types",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.getAllDiscountType
);
//create voucher
router.post(
  "/vouchers",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  promoValidator.validateCreateVoucher,
  adminController.createVoucher
);
// get all vouchers
router.get(
  "/vouchers",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.getAllVoucher
);
// get all voucher types
router.get(
  "/voucher-types",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.getAllVoucherType
);
module.exports = router;
