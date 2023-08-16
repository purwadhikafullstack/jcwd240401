const router = require("express").Router();
const {auth: authController} = require("../controllers")
const authValidator = require("../middleware/validatorMiddleware")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/login", authValidator.validateLogin, authController.login)
router.post("/admins/register", authValidator.validateRegisterAdmin, authController.registerAdmin)
router.post("/admins/set-password", authValidator.validateSetPasswordAdmin, authController.setPassword)
router.get("/admins/all-branch", authController.allBranch)
router.get("/all-province", authController.allProvince)
router.get("/all-city", authController.allCityByProvince)

router.get("/nearest-branch", authController.nearestBranch)

router.get("/keep-login", authMiddleware.verifyToken, authController.keepLogin)

module.exports = router;
