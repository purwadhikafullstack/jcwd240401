import React, {useState} from 'react'
import { Link } from 'react-router-dom'
import {useFormik} from 'formik'
import axios from 'axios'
import background from '../assets/BackgroundLeaves.jpg'
import InputField from '../component/InputField'
import Button from '../component/Button'
import groceereLogo from '../assets/logo_Groceer-e.svg'
import forgotPassword from '../assets/Forgot password.png'
import { forgotPasswordSchema } from '../helpers/validationSchema'
import AlertPopUp from '../component/AlertPopUp'

export default function Login() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    
    const onSubmit = async(values, actions) => {
        try{
            const response = await axios.post("http://localhost:8000/api/auth/forgot-password", values, {
                headers: {"Content-Type" : "application/json"}
            })
            if (response.status === 200){
                actions.resetForm()
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
            }
        }catch(error){
            if(error.response.status === 500){
                setErrorMessage("Can't send email: Server error")
            }else if(error.response?.data?.message === "Email not found"){
                setErrorMessage("Email not found")
            }
            handleShowAlert()
        }
    }
    const {values, errors, touched, handleChange, handleBlur, handleSubmit} = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: forgotPasswordSchema,
        onSubmit
    })

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
        <div className="absolute w-full min-h-screen bg-cover bg-center flex justify-center items-center" style={{backgroundImage: `url(${background})`, backgroundSize: 'cover'}}>
        <div className="sw-72 lg:w-2/3 lg:grid lg:grid-cols-2">
            <div className="hidden lg:flex lg:flex-col lg:gap-2 lg:justify-start lg:items-start lg:w-full">
                <img src={groceereLogo} alt="logo" />
                <div className='font-inter font-bold'>Your go-to grocery shop</div>
                <div className='text-3xl text-maingreen font-inter font-bold mt-10'>Forgot Password</div>
                <img src={forgotPassword} alt="set password illustration" className='w-80 h-80'/>
            </div>
            <div className="flex justify-center flex-col gap-2 items-center">
                <div className="mb-10 lg:hidden flex flex-col justify-center items-center">
                    <img src={groceereLogo} alt="logo" className='mb-6'/>
                    <div className='text-2xl text-maingreen font-inter font-bold'>Forgot Password</div>
                    <img src={forgotPassword} alt="logo" className="w-52 h-52"/>
                </div>
                <div className="w-72">
                    {errorMessage ? (<AlertPopUp condition={"fail"} content={errorMessage}/>) : (null)}
                    {successMessage ? (<AlertPopUp condition={"success"} content={successMessage} />) : (null)}
                </div>
                <form onSubmit={handleSubmit} autoComplete="off" className="w-72 flex flex-col gap-2">
                    <div className="w-full">
                        <label htmlFor="email" className="font-inter">Email</label>
                        <InputField value={values.email} id={"email"} type={"string"} onChange={handleChange} onBlur={handleBlur}/>
                        {errors.email && touched.email && <p className="text-reddanger text-sm font-inter">{errors.email}</p>}
                    </div>
                    <div className="mt-10">
                        <Button label={"Send Reset Password Link"} condition={"positive"} onClick={handleSubmit}/>
                    </div>
                </form>
                <div className="w-full flex gap-4 justify-center items-center">
                  <Link to="/login" className="font-inter text-sm font-bold text-maingreen">Back To Log In</Link>
                </div>
            </div>
        </div>
      </div>
        </>
    )
}
