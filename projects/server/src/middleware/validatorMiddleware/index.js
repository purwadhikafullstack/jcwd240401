const { body, validationResult, oneOf } = require("express-validator");
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

const checkUniqueCategory = async (value, { req }) => {
  try {
    const category = await db.Category.findOne({
      where: { name: value, isRemoved: 0 },
    });
    if (category) {
      throw new Error("Category name already exist");
    }
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const checkValidCategory = async (value, { req }) => {
  try {
    const category = await db.Category.findOne({
      where: { id: value, isRemoved: 0 },
    });
    if (!category) {
      throw new Error("Selected category is not found/removed");
    }
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const checkValidProduct = async (value, { req }) => {
  try {
    const product = await db.Product.findOne({
      where: { id: value, isRemoved: 0 },
    });
    if (!product) {
      throw new Error("Selected product is not found/removed");
    }
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  validateLogin: validate([
    body("email").notEmpty().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
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
    body("phone").notEmpty().withMessage("phone number is required"),
    body("province").notEmpty().withMessage("Branch province is required"),
    body("city").notEmpty().withMessage("Branch city is required"),
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
  createCategory: validate([
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Category name is required")
      .custom(checkUniqueCategory),
  ]),
  updateCategory: validate([
    body("name").optional().custom(checkUniqueCategory),
  ]),
  createProduct: validate([
    body("category_id")
      .notEmpty()
      .withMessage("Category is required")
      .custom(checkValidCategory),
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Product name is required")
      .isLength({ max: 50 })
      .withMessage("Maximum character is 50"),
    body("description")
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ max: 500 })
      .withMessage("Maximum character is 500"),
    body("weight")
      .notEmpty()
      .withMessage("Weight is required")
      .isInt({ gt: 0 })
      .withMessage("Weight must be a positive integer"),
    body("unitOfMeasurement")
      .notEmpty()
      .withMessage("Unit of measurement is required")
      .isIn(["gr", "ml"])
      .withMessage("Unit of measurement must be 'gr' or 'ml'"),
    body("basePrice")
      .trim()
      .notEmpty()
      .withMessage("Price is required")
      .isInt({
        gt: 0,
        lt: 100000000,
      })
      .withMessage("Price must be a valid number and not exceed 100,000,000"),
    body("storageInstruction")
      .trim()
      .notEmpty()
      .withMessage("Storage instruction is required")
      .isLength({ max: 255 })
      .withMessage("Maximum character is 255"),
    body("storagePeriod")
      .trim()
      .notEmpty()
      .withMessage("Storage period is required")
      .isLength({ max: 255 })
      .withMessage("Maximum character is 255"),
  ]),
  updateProduct: validate([
    body("name")
      .trim()
      .optional()
      .isLength({ max: 50 })
      .withMessage("Name must not exceed 50 characters"),
    body("description")
      .trim()
      .optional()
      .isLength({ max: 500 })
      .withMessage("Maximum character is 500"),
    body("weight")
      .trim()
      .optional()
      .custom((value, { req }) => {
        if (value !== "" && isNaN(value)) {
          throw new Error("Price must be a valid number");
        }
        if (value !== "" && parseInt(value) < 0) {
          throw new Error("Price must be a positive integer");
        }
        return true;
      }),
    body("unitOfMeasurement")
      .optional()
      .custom((value, { req }) => {
        if (value !== "" && !["gr", "ml"].includes(value)) {
          throw new Error("Unit of measurement must be 'gr' or 'ml'");
        }
        return true;
      }),
    body("basePrice")
      .trim()
      .optional()
      .custom((value, { req }) => {
        if (
          value !== "" &&
          (isNaN(value) || parseInt(value) < 0 || parseInt(value) > 100000000)
        ) {
          throw new Error(
            "Price must be a valid number and not exceed 100,000,000"
          );
        }
        return true;
      }),
    body("storageInstruction")
      .trim()
      .optional()
      .isLength({ max: 255 })
      .withMessage("Maximum character is 255"),
    body("storagePeriod")
      .trim()
      .optional()
      .isLength({ max: 255 })
      .withMessage("Maximum character is 255"),
  ]),
  validateCreateDiscount: validate([
    body("discount_type_id")
      .notEmpty()
      .withMessage("discount type is required"),

    body("expiredDate")
      .notEmpty()
      .withMessage("expired date is required")
      .isDate()
      .withMessage("Invalid date format")
      .custom((value) => {
        const currentDate = new Date();
        const selectedDate = new Date(value);
        if (selectedDate < currentDate) {
          throw new Error("expired date cannot be in the past");
        }
        return true;
      }),
    body("amount")
      .if(body("discount_type_id").not().equals("1"))
      .notEmpty()
      .withMessage("amount cannot be empty")
      .isNumeric()
      .withMessage("amount has to be numeric"),
  ]),
  validateCreateVoucher: validate([
    body("isReferral").isBoolean().withMessage("isReferral has to be boolean"),
    body("voucher_type_id").notEmpty().withMessage("discount type is required"),

    body("amount")
      .optional()
      .custom((value, { req }) => {
        if (value !== "" && isNaN(value)) {
          throw new Error("amount must be a valid number");
        }
        if (value !== "" && parseInt(value) < 0) {
          throw new Error("amount must be a positive integer");
        }
        return true;
      }),
    body("maxDiscount")
      .optional()
      .custom((value, { req }) => {
        if (value !== "" && isNaN(value)) {
          throw new Error("amount must be a valid number");
        }
        if (value !== "" && parseInt(value) < 0) {
          throw new Error("amount must be a positive integer");
        }
        return true;
      }),

    body("usedLimit")
      .optional()
      .custom((value, { req }) => {
        if (value !== "" && isNaN(value)) {
          throw new Error("amount must be a valid number");
        }
        if (value !== "" && parseInt(value) < 0) {
          throw new Error("amount must be a positive integer");
        }
        return true;
      }),
    body("expiredDate")
      .optional()
      .custom((value) => {
        if (value) {
          const currentDate = new Date();
          const selectedDate = new Date(value);
          if (selectedDate < currentDate) {
            throw new Error("expired date cannot be in the past");
          }
        }
        return true;
      }),
    // body("minTransaction").isNumeric().withMessage("amount has to be numeric"),
    // body("maxDiscount").isNumeric().withMessage("amount has to be numeric"),
  ]),
};
