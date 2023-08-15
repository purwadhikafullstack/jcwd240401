const { body, validationResult } = require("express-validator");
const db = require("../../models");

const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res
      .status(400)
      .send({ message: "An error occurs", errors: errors.array() });
  };
};

module.exports = {
  validateLogin: validate([
    body("email")
    .notEmpty()
    .withMessage("Email is required"),
    body("password")
    .notEmpty()
    .withMessage("Password is required")
  ]),
  validateRegisterAdmin: validate([
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 50 })
      .withMessage("Maximum character is 50"),
    body("email")
      .isEmail()
      .withMessage("incorrect email format")
      .notEmpty()
      .withMessage("email is required"),
    body("phone")
      .notEmpty()
      .withMessage("phone number is required"),
    body("province")
      .notEmpty()
      .withMessage("Branch province is required"),
    body("city")
      .notEmpty()
      .withMessage("Branch city is required")
  ]),
  validateSetPasswordAdmin: validate([
    body("password")
      .isLength({ min: 8 })
      .withMessage("minimum password length is 8 characters")
      .isStrongPassword({
          minSymbols: 0,
      })
      .withMessage(
          "password must contain 1 uppercase, 1 lowercase and 1 number"
      ),
    body("confirmPassword")
      .notEmpty()
      .withMessage("confirm password is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          return false;
        }
        return true;
      })
      .withMessage("password does not match"),
  ]),
  validateCreateDiscount: validate([
    body("discount_type_id")
      .notEmpty()
      .withMessage("discount type is required"),
  ]),
};
