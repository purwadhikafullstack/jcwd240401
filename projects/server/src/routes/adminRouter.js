const router = require("express").Router();
const productController = require("../controllers/productController");
const { admin: adminController } = require("../controllers");
const multerMiddleware = require("../middleware/multerMiddleware/category");

// create category
router.post(
  "/category",
  multerMiddleware.single("file"),
  productController.createCategory
);
router.post("/discounts", adminController.createDiscount);
router.get("/discounts", adminController.allDiscount);

module.exports = router;
