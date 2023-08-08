const router = require("express").Router();
const productController = require("../controllers/productController");
const multerMiddleware = require("../middleware/multerMiddleware/category");

// create category
router.post(
  "/category",
  multerMiddleware.single("file"),
  productController.createCategory
);

module.exports = router;
