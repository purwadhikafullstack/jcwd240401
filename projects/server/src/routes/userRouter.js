const router = require("express").Router();
const {user: userController } = require("../controllers")
const {product: productController} = require("../controllers")
const userMiddleware = require("../middleware/authMiddleware")

router.get("/profile", userController.getProfileWithVerificationToken)
router.get("/address", userMiddleware.verifyToken, userController.getAddress)
router.get("/branch-products", productController.productsFromNearestBranch)


module.exports = router;
