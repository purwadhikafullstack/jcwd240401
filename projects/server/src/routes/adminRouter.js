const router = require("express").Router();
const { product: productController, auth } = require("../controllers");
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
router.get(
  "/categories",
  authMiddleware.verifyToken,
  productController.allCategory
);
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
router.patch(
  "/categories/:id/:action",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  categoryMulterMiddleware,
  validatorMiddleware.updateCategory,
  productController.modifyOrRemoveCategory
);
router.post(
  "/product",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  productMulterMiddleware,
  validatorMiddleware.createProduct,
  productController.createProduct
);
router.patch(
  "/products/:id/:action",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  productMulterMiddleware,
  validatorMiddleware.updateProduct,
  productController.modifyOrRemoveProduct
);
router.get(
  "/products",
  authMiddleware.verifyToken,
  productController.allProduct
);
router.get(
  "/products/:id",
  authMiddleware.verifyToken,
  productController.oneProductById
);

router.get(
  "/branch",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  adminController.allBranch
);

router.post(
  "/my-branch/branch-products",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  validatorMiddleware.createBranchProduct,
  adminController.addBranchProduct
);
router.patch(
  "/my-branch/branch-products/:id/:action",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  validatorMiddleware.updateBranchProductDetails,
  adminController.modifyOrRemoveBranchProduct
);
router.patch(
  "/my-branch/branch-products/:id/stock/:action",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  validatorMiddleware.updateBranchProductStock,
  adminController.plusOrMinusBranchProduct
);
router.get(
  "/my-branch/branch-products",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.allBranchProduct
);
router.get(
  "/my-branch/no-pagination-branch-products",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.allBranchProductNoPagination
);
router.get(
  "/my-branch/branch-products/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.branchProductPerId
);
router.get(
  "/my-branch/unadded-products",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  productController.allUnaddedProducts
);
router.post(
  "/discounts",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  promoValidator.validateCreateDiscount,
  adminController.createDiscount
);
router.get(
  "/discounts",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.getAllDiscount
);
router.get(
  "/discount-types",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.getAllDiscountType
);
router.post(
  "/vouchers",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  promoValidator.validateCreateVoucher,
  adminController.createVoucher
);
router.get(
  "/vouchers",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.getAllVoucher
);
router.get(
  "/voucher-types",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.getAllVoucherType
);
router.get(
  "/stock-history",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.getStockHistory
);

router.get(
  "/stock-history-sa",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  adminController.getStockHistorySuperAdmin
);

router.get(
  "/no-pagination-all-branch",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  adminController.allBranchNoPagination
);

router.get(
  "/no-pagination-branch-products-sa",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  adminController.allBranchProductNoPaginationSuperAdmin
);

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

router.get(
  "/sa-sales-report",
  authMiddleware.verifyToken,
  authMiddleware.verifySuperAdmin,
  adminController.getSuperAdminSalesReport
);

router.get(
  "/branch-info",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  adminController.branchInfo
)
module.exports = router;
