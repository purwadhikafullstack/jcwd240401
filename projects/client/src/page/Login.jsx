import React, {useState} from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {useFormik} from 'formik'
import axios from 'axios'
import { HiEye } from 'react-icons/hi'
import { useDispatch } from 'react-redux'
import backgroundLogin from '../assets/BackgroundLeaves.jpg'
import InputField from '../component/InputField'
import Button from '../component/Button'
import groceereLogo from '../assets/logo_Groceer-e.svg'
import loginPic from '../assets/LoginPic.png'
import { loginSchema } from '../helpers/validationSchema'
import AlertPopUp from '../component/AlertPopUp'
import { keep } from '../store/reducer/authSlice'

export default function Login() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showAlert, setShowAlert] = useState(false)

    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const onSubmit = async(values, actions) => {
        try{
            const response = await axios.post("http://localhost:8000/api/auth/login", values, {
                headers: {"Content-Type" : "application/json"}
            })
            if (response.status === 200){
                actions.resetForm()
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
                const token = response.data?.accessToken
                localStorage.setItem("token", token)
                handleShowAlert()
                const payload = token.split(".")[1]
                const decoded = JSON.parse(atob(payload))
                dispatch(keep(decoded))
                if(Number(decoded.role) === 1 || Number(decoded.role) === 2){
                    setTimeout(() => {
                        navigate("/admin")
                    }, 2000)
                } else {
                    setTimeout(() => {
                        navigate("/")
                    }, 2000)
                }
            }
        }catch(error){
            if(error.response.status === 500){
                setErrorMessage("Login failed: Server error")
            }else if(error.response?.data?.message === "Login failed. Please input your registered email and password"){
                setErrorMessage("Login failed. Please input your registered email and password")
            }
            handleShowAlert()
        }
    }
    const {values, errors, touched, handleChange, handleBlur, handleSubmit} = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: loginSchema,
        onSubmit
    })

    const togglePassword = () => {
        setShowPassword(!showPassword);
      }

    const handleShowAlert = () => {
        setShowAlert(true)
        setTimeout(() => {
            setShowAlert(false)
        }, 4000)
    }

    const handleHideAlert = () => {
        setShowAlert(false)
    }

    return (
        <>
        <div className="absolute w-full min-h-screen bg-cover bg-center flex justify-center items-center" style={{backgroundImage: `url(${backgroundLogin})`, backgroundSize: 'cover'}}>
            <div className="sw-72 lg:w-2/3 lg:grid lg:grid-cols-2">
                <div className="hidden lg:flex lg:flex-col lg:gap-2 lg:justify-start lg:items-start lg:w-full">
                    <img src={groceereLogo} alt="logo" />
                    <div className='font-inter font-bold'>Your go-to grocery shop</div>
                    <div className='text-3xl text-maingreen font-inter font-bold mt-10'>Log In</div>
                    <img src={loginPic} alt="log in illustration" className="w-80 h-80"/>
                </div>
                <div className="flex justify-center flex-col gap-2 items-center">
                    <div className="mb-10 lg:hidden">
                        <img src={groceereLogo} alt="logo"/>
                        <div className="font-inter font-bold">Your go-to grocery shop</div>
                    </div>
                    <div className="w-72">
                        {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert}/>) : (null)}
                    </div>
                    <form onSubmit={handleSubmit} autoComplete="off" className="w-72 flex flex-col gap-2">
                        <div className="w-full">
                            <label htmlFor="email" className="font-inter">Email</label>
                            <InputField value={values.email} id={"email"} type={"string"} onChange={handleChange} onBlur={handleBlur}/>
                            {errors.email && touched.email && <p className="text-reddanger text-sm font-inter">{errors.email}</p>}
                        </div>
                        <div className="w-full">
                            <label htmlFor="password" className="font-inter">Password</label>
                            <InputField value={values.password} id={"password"} type={showPassword ? "text" : "password"} onChange={handleChange} onBlur={handleBlur}/>
                            {errors.password && touched.password && <p className="text-reddanger text-sm font-inter">{errors.password}</p>}
                            <div className="w-full flex gap-4 mt-2 justify-end items-center">
                                <span className="text-sm text-maingreen font-inter">Forgot Password?</span>
                                <HiEye className="w-6 h-6 text-darkgrey" onClick={togglePassword} />
                            </div>
                        </div>
                        <div className="mt-10">
                            <Button label={"Log In"} condition={"positive"} onClick={handleSubmit}/>
                        </div>
                    </form>
                    <div className="w-full flex gap-4 justify-center items-center">
                        <div className="font-inter text-sm">Don't have an account?</div>
                        <Link to="/register" className="font-inter text-sm font-bold text-maingreen">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}
