import * as yup from 'yup'

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
// password must be at least 6 characters, 1 lowercase, 1 uppercase, 1 digit

const setPasswordSchema = yup.object().shape({
    password: yup.string().min(8).matches(passwordRules, {message: "Password must be at least 8 characterts with 1 lowercase, 1 uppercase, and 1 number"}).required("Password is required"),
    confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Password must match").required("You must confirm your password")
})

const forgotPasswordSchema = yup.object().shape({
    email: yup.string().email("Incorrent email format").required("Email is required")
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

export {loginSchema, registerAdminSchema, setPasswordSchema, forgotPasswordSchema, registerUserSchema}