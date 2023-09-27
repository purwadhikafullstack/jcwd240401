import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import axios from "axios";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useDispatch } from "react-redux";
import jwtDecode from "jwt-decode";
import backgroundLogin from "../assets/BackgroundLeaves.jpg";
import InputField from "../component/InputField";
import Button from "../component/Button";
import groceereLogo from "../assets/logo_Groceer-e.svg";
import loginPic from "../assets/LoginPic.png";
import { loginSchema } from "../helpers/validationSchema";
import { keep } from "../store/reducer/authSlice";
import { updateCart } from "../store/reducer/cartSlice";
import AlertHelper from "../component/AlertHelper";
import { login } from "../api/auth"

export default function Login() {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (values, actions) => {
    actions.setSubmitting(true)
    setIsLoading(true)
    try {
      const response = await login(values)
      if (response.status === 200) {
        actions.resetForm();
        actions.setSubmitting(false)
        setIsLoading(false)
        setErrorMessage("");
        setSuccessMessage(response.data?.message);
        const token = response.data?.accessToken;
        localStorage.setItem("token", token);
        const decoded = jwtDecode(token);
        dispatch(keep(decoded));
        if (Number(decoded.role) === 1 || Number(decoded.role) === 2) {
          setTimeout(() => {
            navigate("/admin");
          }, 2000);
        } else {
          const responseCart = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/users/carts`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (responseCart) {
            dispatch(updateCart(responseCart.data.data));
          }
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 2000);
        }
      }
    } catch (error) {
      if (error.response.status === 500) {
        setErrorMessage("Login failed: Server error");
      } else if (
        error.response?.data?.message) {
        setErrorMessage(
          error.response?.data?.message
        );
      }
      actions.setSubmitting(false)
      setIsLoading(false)
    }
  };
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } =
    useFormik({
      initialValues: {
        email: "",
        password: "",
      },
      validationSchema: loginSchema,
      onSubmit,
    });

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div
        className="absolute w-full min-h-screen bg-cover bg-center flex justify-center items-center"
        style={{
          backgroundImage: `url(${backgroundLogin})`,
          backgroundSize: "cover",
        }}
      >
        <div className="lg:w-2/3 lg:grid lg:grid-cols-2">
          <div className="hidden lg:flex lg:flex-col lg:gap-2 lg:justify-start lg:items-start lg:w-full">
            <Link to="/"><img src={groceereLogo} alt="logo" /></Link>
            <div className="font-inter font-bold">Your go-to grocery shop</div>
            <div className="text-3xl text-maingreen font-inter font-bold mt-10">Log In</div>
            <img
              src={loginPic}
              alt="log in illustration"
              className="w-80 h-80"
            />
          </div>
          <div className="flex justify-center flex-col gap-2 items-center">
            <div className="mb-10 lg:hidden">
              <Link to="/"><img src={groceereLogo} alt="logo" /></Link>
              <div className="font-inter font-bold">
                Your go-to grocery shop
              </div>
            </div>
            <div className="w-72">
              <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
            </div>
            <form
              onSubmit={handleSubmit}
              autoComplete="off"
              className="w-72 flex flex-col gap-2"
            >
              <div className="w-full">
                <label htmlFor="email" className="font-inter">Email</label>
                <InputField
                  value={values.email}
                  id={"email"}
                  type={"string"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.email && touched.email && (<p className="text-reddanger text-sm font-inter">{errors.email}</p>)}
              </div>
              <div className="w-full">
                <div className="relative">
                  <label htmlFor="password" className="font-inter relative">Password</label>
                  <InputField
                    value={values.password}
                    id={"password"}
                    type={showPassword ? "text" : "password"}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="relative"
                  />
                  <div className="absolute bottom-2 right-2 cursor-pointer">
                    {showPassword ? (<HiEyeOff className="w-6 h-6 text-darkgrey" onClick={togglePassword} />) : (<HiEye
                      className="w-6 h-6 text-darkgrey"
                      onClick={togglePassword}
                    />)}
                  </div>
                </div>
                {errors.password && touched.password && (
                  <p className="text-reddanger text-sm font-inter">
                    {errors.password}
                  </p>
                )}
                <div className="w-full flex gap-4 mt-2 justify-end items-center">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-maingreen font-inter"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
              <div className="mt-10 flex flex-col items-center gap-2">
                {isLoading ? (<div className='text-sm text-maingreen font-inter'>Loading...</div>) : null}
                <Button
                  label={"Log In"}
                  condition={"positive"}
                  onClick={handleSubmit}
                  buttonType={"submit"}
                  isDisabled={isSubmitting}
                />
              </div>
            </form>
            <div className="w-full flex gap-4 justify-center items-center">
              <div className="font-inter text-sm">Don't have an account?</div>
              <Link
                to="/register"
                className="font-inter text-sm font-bold text-maingreen"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
