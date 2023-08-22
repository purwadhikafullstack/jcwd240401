const router = require("express").Router();
const {admin:adminController} =require("../controllers")

router.get("/carts", adminController.getCart);

module.exports = router;
