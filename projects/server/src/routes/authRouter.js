const router = require("express").Router();
const {auth: authController} = require("../controllers")
const authValidator = require("../middleware/validatorMiddleware")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/login", authValidator.validateLogin, authController.login)
router.post("/admins/register", authMiddleware.verifyToken, authMiddleware.verifySuperAdmin, authValidator.validateRegisterAdmin, authController.registerAdmin)
router.post("/admins/set-password", authValidator.validateSetPassword, authController.setPassword)
router.get("/all-province", authController.allProvince)
router.get("/all-city", authController.allCityByProvince)

router.get("/nearest-branch", authController.nearestBranch)

router.get("/keep-login", authMiddleware.verifyToken, authController.keepLogin)

router.post("/users/register", authValidator.validateRegisterUser, authController.registerUser)
router.patch("/users/verify", authController.verifyAccount)
router.post("/forgot-password", authValidator.validateForgotPassword, authController.forgotPassword)
router.post("/reset-password", authValidator.validateSetPassword, authController.resetPassword)

module.exports = router;
