import * as yup from 'yup';
import { fileMaxSize, fileMaxSizeNull } from './fileMaxSize';

const loginSchema = yup.object().shape({
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().required("Password is required")
})

const registerAdminSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Incorrect email format").required("Email is required"),
    phone: yup.string().required("Phone is required"),
    province: yup.string().required("Province is required"),
    city: yup.string().required("City is required"),
    streetName: yup.string().required("Street Address is required")
})

const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/

const setPasswordSchema = yup.object().shape({
    password: yup.string().min(8).matches(passwordRules, {message: "Password must be at least 8 characterts with 1 lowercase, 1 uppercase, and 1 number"}).required("Password is required"),
    confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Password must match").required("You must confirm your password")
})

const forgotPasswordSchema = yup.object().shape({
    email: yup.string().email("Incorrent email format").required("Email is required")
})

const changePasswordSchema = yup.object().shape({
    currentPassword: yup.string().required("Current password is required"),
    password: yup.string().min(8).matches(passwordRules, {message: "Password must be at least 8 characterts with 1 lowercase, 1 uppercase, and 1 number"}).required("Password is required"),
    confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Password must match").required("You must confirm your password")
})

const registerUserSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Incorrect email format").required("Email is required"),
    phone: yup.string().required("Phone is required"),
    password: yup.string().min(8).matches(passwordRules, {message: "Password must be at least 8 characterts with 1 lowercase, 1 uppercase, and 1 number"}).required("Password is required"),
    confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Password must match").required("You must confirm your password"),
    province: yup.string().required("Province is required"),
    city: yup.string().required("City is required"),
    streetName: yup.string().required("Street address is required")
})

const validRgx = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

const modifyProfileSchema = yup.object().shape({
    name: yup.string().max(50, 'Maximum character is 50').trim().nullable(),
    email: yup.string().email('Please enter with email format').nullable(),
    phone: yup.string().matches(validRgx, 'Phone number is not valid').nullable(),
    gender: yup.string().oneOf(['male', 'female'], 'Gender must be "male" or "female"').nullable(),
    birthdate: yup.date().max(new Date(), 'Birthdate cannot be in the future').nullable(),
});

const createAddressSchema = yup.object().shape({
    receiver: yup.string().trim().required("Receiver is required").max(50, "Maximum character is 50").typeError("Receiver must be a valid text"),
    contact: yup.string().required('Contact is required').matches(validRgx, "Contact is not valid"),
    streetName: yup.string().trim().required("Street name is required").max(255, "Maximum character is 255").typeError("Street name must be a valid text"),
    province: yup.string().required("Province is required"),
    city: yup.string().required("City is required"),
    addressLabel: yup.string().required("Address label is required"),
});

const modifyAddressSchema = yup.object().shape({
    receiver: yup.string().trim().max(50, "Maximum character is 50").typeError("Receiver must be a valid text").nullable(),
    contact: yup.string().matches(validRgx, "Contact is not valid").nullable(),
    streetName: yup.string().trim().max(255, "Maximum character is 255").typeError("Street name must be a valid text").nullable(),
    province: yup.string().nullable(),
    city: yup.string().nullable(),
    addressLabel: yup.string().nullable(),
});

const createProductSchema = yup.object().shape({
    file: fileMaxSize(1024 * 1024).required("Product image is required"),
    name: yup.string().trim().required("Product name is required").max(50, "Maximum character is 50").typeError("Name must be a valid text"),
    category_id: yup.string().trim().required("Category is required"),
    description: yup.string().trim().required("Description is required").max(255, "Maximum character is 255").typeError("Description must be a valid text"),
    weight: yup.number().required("Weight is required").min(5, "Weight must be at least 5").typeError('Weight must be a valid number'),
    unitOfMeasurement: yup.string().trim().required("Unit of measurement is required").oneOf(["gr", "ml"], "Unit of measurement must be 'gr' or 'ml'"),
    basePrice: yup.number().required("Price is required").min(1000, "Weight must be at least Rp 1.000").typeError('Base price must be a valid number'),
    storageInstruction: yup.string().trim().required("Storage instruction is required").max(255, "Maximum character is 255").typeError("Storage instruction must be a valid text"),
    storagePeriod: yup.string().trim().required("Storage period is required").max(255, "Maximum character is 255").typeError("Storage period must be a valid text"),
});

const createCategorySchema = yup.object().shape({
    name: yup
      .string()
      .max(50, "Category name must not exceed 50 characters")
      .required("Category name is required")
      .typeError("Name must be a valid text"),
    file: fileMaxSize(1024 * 1024).required("Category image is required"),
});

const createBranchProductSchema = yup.object().shape({
    product_id: yup.string().trim().required("Product is required"),
    origin: yup.string().trim().required("Origin is required").max(50, "Maximum character is 50").typeError("Origin must be a valid text"),
    quantity: yup.number().required("Quantity is required").min(1, "Quantity must be at least 1").typeError('Quantity must be a valid number'),
});

const modifyProductSchema = yup.object().shape({
    name: yup.string().trim().max(50, "Maximum character is 50").typeError("Name must be a valid text"),
    category_id: yup.string().trim(),
    description: yup.string().trim().max(500, "Maximum character is 500").typeError("Description must be a valid text"),
    weight: yup.number().test("is-positive-integer", "Weight must be a positive integer", (value) => { return !isNaN(value) && parseInt(value) > 0; }),
    unitOfMeasurement: yup.string().trim().oneOf(["gr", "ml"], "Unit of measurement must be 'gr' or 'ml'"),
    basePrice: yup.number().test("is-valid-number", "Price must be a valid number", (value) => { return !isNaN(value); })
        .test("is-price-valid-range", "Price must be between 0 and 100,000,000", (value) => {
            const numericValue = parseInt(value);
            return numericValue >= 0 && numericValue <= 100000000;
        }),
    storageInstruction: yup.string().trim().max(255, "Maximum character is 255").typeError("Storage instruction must be a valid text"),
    storagePeriod: yup.string().trim().max(255, "Maximum character is 255").typeError("Storage period must be a valid text"),
    file: fileMaxSizeNull(1024 * 1024).nullable()
});

const modifyCategorySchema = yup.object().shape({
    name: yup.string().max(50, 'Category name must not exceed 50 characters').typeError("Name must be a valid text"),
    file: fileMaxSizeNull(1024 * 1024).nullable()
});

const modifyBranchProductQuantitySchema = yup.object().shape({
    quantity: yup.number().required("Quantity is required").min(1, "Quantity must be at least 1").typeError('Quantity must be a valid number'),
});

const modifyBranchProductDetailsSchema = yup.object().shape({  
    origin: yup.string().trim().required("Origin is required").max(50, "Maximum character is 50").typeError("Origin must be a valid text"),
});

const createDiscountSchema = yup.object().shape({
    discount_type_id: yup.number().required("discount type is required"),
    amount: yup
      .number()
      .typeError("amount must be a number")
      .when("discount_type_id", (discount_type_id, createDiscountSchema) => {
        if (discount_type_id == 2)
          return createDiscountSchema
            .min(1, "amount must be greater than 1")
            .max(100, "amount cannot be greater than 100")
            .required("amount is required");
        if (discount_type_id == 3)
          return createDiscountSchema
            .min(1, "amount must be greater than 1")
            .required("amount is required");
        return createDiscountSchema;
      }),

    expiredDate: yup
      .date()
      .typeError("expired date must be a date format")
      .min(new Date(), "expired date can't be in the past or today")
      .required("expired date is required"),
    products: yup.array().min(1, "you have to add atleast one product"),
  });

  const createVoucherSchema = yup.object().shape({
    isReferral: yup.boolean(),
  });

export {
    loginSchema,
    registerAdminSchema,
    setPasswordSchema,
    forgotPasswordSchema,
    registerUserSchema,
    changePasswordSchema,
    modifyProfileSchema,
    createAddressSchema,
    modifyAddressSchema,
    createProductSchema,
    createCategorySchema,
    createBranchProductSchema,
    modifyProductSchema,
    modifyCategorySchema,
    modifyBranchProductQuantitySchema,
    modifyBranchProductDetailsSchema,
    createDiscountSchema,
    createVoucherSchema
  };