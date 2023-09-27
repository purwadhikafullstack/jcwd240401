const router = require("express").Router();
const {auth: authController, user: userController} = require("../controllers")
const authValidator = require("../middleware/validatorMiddleware")
const authMiddleware = require("../middleware/authMiddleware")
const openCageMiddleware = require("../middleware/openCageMiddleware");

router.post("/login", authValidator.validateLogin, authController.login)
router.post("/admins/register", authMiddleware.verifyToken, authMiddleware.verifySuperAdmin, authValidator.validateRegisterAdmin, openCageMiddleware.addressUserCoordinate, authController.registerAdmin)
router.post("/admins/set-password", authValidator.validateSetPassword, authController.setPassword)
router.get("/all-province", authController.allProvince)
router.get("/all-city", authController.allCityByProvince)

router.get("/keep-login", authMiddleware.verifyToken, authController.keepLogin)

router.post("/users/register", authValidator.validateRegisterUser, openCageMiddleware.addressUserCoordinate, authController.registerUser)
router.patch("/users/verify", authController.verifyAccount)
router.get("/users/profile", userController.getProfileWithVerificationToken);
router.post("/forgot-password", authValidator.validateForgotPassword, authController.forgotPassword)
router.post("/users/reset-password", authValidator.validateSetPassword, authController.resetPassword)
router.post("/users/change-password", authMiddleware.verifyToken,authMiddleware.verifyUser, authValidator.validateChangePassword,authController.changePassword)

module.exports = router;
