const router = require("express").Router();
const {auth: authController} = require("../controllers")
const authValidator = require("../middleware/validatorMiddleware")

router.post("/login", authValidator.validateLogin, authController.login)
router.post("/admins/register", authValidator.validateRegisterAdmin, authController.registerAdmin)
router.post("/admins/set-password", authValidator.validateSetPasswordAdmin, authController.setPassword)
router.get("/admins/all-branch", authController.allBranch)

module.exports = router;
