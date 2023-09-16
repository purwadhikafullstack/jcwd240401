const router = require("express").Router();
const { product: productController } = require("../controllers");
const { admin: adminController } = require("../controllers");
const { transaction: transactionController } = require("../controllers");
const categoryMulterMiddleware = require("../middleware/multerMiddleware/category");
const productMulterMiddleware = require("../middleware/multerMiddleware/product");
const refundMulterMiddleware = require("../middleware/multerMiddleware/refund");
const validatorMiddleware = require("../middleware/validatorMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const promoValidator = require("../middleware/validatorMiddleware");

router.post(
  "/category",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  categoryMulterMiddleware,
  validatorMiddleware.createCategory,
  productController.createCategory
);
// get category
router.get(
  "/categories",
  authMiddleware.verifyToken,
  productController.allCategory
);
// get category
router.get(
  "/no-pagination-categories",
  authMiddleware.verifyToken,
  productController.allCategoryNoPagination
);
router.get(
  "/categories/:id",
  authMiddleware.verifyToken,
  productController.oneCategoryById
);
//modify / remove category
router.patch(
  "/categories/:id/:action",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  categoryMulterMiddleware,
  validatorMiddleware.updateCategory,
  productController.modifyOrRemoveCategory
);
// create product
router.post(
  "/product",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  productMulterMiddleware,
  validatorMiddleware.createProduct,
  productController.createProduct
);
// modify / remove product
router.patch(
  "/products/:id/:action",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  productMulterMiddleware,
  validatorMiddleware.updateProduct,
  productController.modifyOrRemoveProduct
);
// get product
router.get(
  "/products",
  authMiddleware.verifyToken,
  productController.allProduct
);
router.get(
  "/no-pagination-products",
  authMiddleware.verifyToken,
  productController.allProductNoPagination
);
// get one product
router.get(
  "/products/:id",
  authMiddleware.verifyToken,
  productController.oneProductById
);

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
  validatorMiddleware.createBranchProduct,
  adminController.addBranchProduct
);
// modify / remove branch product
router.patch(
  "/my-branch/branch-products/:id/:action",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  validatorMiddleware.updateBranchProductDetails,
  adminController.modifyOrRemoveBranchProduct
);
// plus / minus branch product stock
router.patch(
  "/my-branch/branch-products/:id/stock/:action",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  validatorMiddleware.updateBranchProductStock,
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
//get stock history branch admin
router.get(
  "/stock-history",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.getStockHistory
);

//get stock history superadmin
router.get(
  "/stock-history-sa",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  adminController.getStockHistorySuperAdmin
);

//get all branch no pagination
router.get(
  "/no-pagination-all-branch",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  adminController.allBranchNoPagination
);

//get all branch product no pagination (SA)
router.get(
  "/no-pagination-branch-products-sa",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  adminController.allBranchProductNoPaginationSuperAdmin
);

//get transactions for branch Admin
router.get(
  "/branch-orders",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  transactionController.allOrdersByBranch
);

router.get(
  "/orders",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  transactionController.allOrders
);

router.get(
  "/order",
  authMiddleware.verifyToken,
  authMiddleware.verifyIsAdmin,
  transactionController.orderById
);

router.patch(
  "/orders/:id/:action",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  transactionController.changeStatus
);

router.patch(
  "/orders/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  refundMulterMiddleware,
  transactionController.cancelOrderByAdmin
);

router.get(
  "/sales-report",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.getBranchAdminSalesReport
);
module.exports = router;
