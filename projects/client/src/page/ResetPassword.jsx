import React, { useState } from 'react'
import { useFormik } from 'formik'
import { useParams } from 'react-router-dom'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import background from '../assets/BackgroundLeaves.jpg'
import groceereLogo from '../assets/logo_Groceer-e.svg'
import setPasswordPic from '../assets/SetPasswordPic.png'
import InputField from '../component/InputField'
import Button from '../component/Button'
import { setPasswordSchema } from '../helpers/validationSchema'
import AlertHelper from '../component/AlertHelper'
import { resetAccountPassword } from '../api/auth'


export default function ResetPassword() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const { resetPasswordToken } = useParams()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true)
            setIsLoading(true)
            const response = await resetAccountPassword(resetPasswordToken, values)
            if (response.status === 200) {
                actions.resetForm()
                actions.setSubmitting(false)
                setIsLoading(false)
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
            }
        } catch (error) {
            if (error.response.status === 500) {
                setErrorMessage("Login failed: Server error")
            } else if (error.response?.data?.message) {
                setErrorMessage(error.response?.data?.message)
            }
            actions.setSubmitting(false)
            setIsLoading(false)
        }
    }
    const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } = useFormik({
        initialValues: {
            password: "",
            confirmPassword: "",
        },
        validationSchema: setPasswordSchema,
        onSubmit
    })

    const togglePassword = () => {
        setShowPassword(!showPassword);
    }

    return (
        <div className="absolute w-full min-h-screen bg-cover bg-center flex justify-center items-center" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
            <div className="lg:w-2/3 lg:grid lg:grid-cols-2">
                <div className="hidden lg:flex lg:flex-col lg:gap-2 lg:justify-start lg:items-start lg:w-full">
                    <img src={groceereLogo} alt="logo" />
                    <div className='font-inter font-bold'>Your go-to grocery shop</div>
                    <div className='text-3xl text-maingreen font-inter font-bold mt-10'>Reset Your Password</div>
                    <img src={setPasswordPic} alt="set password illustration" className='w-80 h-80' />
                </div>
                <div className="flex justify-center flex-col gap-2 items-center">
                    <div className="mb-10 lg:hidden flex flex-col justify-center items-center">
                        <img src={groceereLogo} alt="logo" className='mb-6' />
                        <div className='text-2xl text-maingreen font-inter font-bold'>Reset Your Password</div>
                        <img src={setPasswordPic} alt="logo" className="w-52 h-52" />
                    </div>
                    <div className="w-72">
                        <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
                    </div>
                    <form onSubmit={handleSubmit} autoComplete="off" className="w-72 flex flex-col gap-2">
                        <div className="w-full">
                            <div className="relative">
                                <label htmlFor="password" className="font-inter relative">Password</label>
                                <InputField value={values.password} id={"password"} type={showPassword ? "text" : "password"} onChange={handleChange} onBlur={handleBlur} className="relative" />
                                <div className='absolute bottom-2 right-2 cursor-pointer'>{showPassword ? (<HiEyeOff className="w-6 h-6 text-darkgrey" onClick={togglePassword} />) : (<HiEye className="w-6 h-6 text-darkgrey" onClick={togglePassword} />)}</div>
                            </div>
                            {errors.password && touched.password && <p className="text-reddanger text-sm font-inter">{errors.password}</p>}
                        </div>
                        <div className="w-full">
                            <label htmlFor="confirmPassword" className="font-inter">Confirm Password</label>
                            <InputField value={values.confirmPassword} id={"confirmPassword"} type={"password"} onChange={handleChange} onBlur={handleBlur} />
                            {errors.confirmPassword && touched.confirmPassword && <p className="text-reddanger text-sm font-inter">{errors.confirmPassword}</p>}
                        </div>
                        <div className="mt-10 flex flex-col items-center gap-2">
                            {isLoading ? (<div className='text-sm text-maingreen font-inter'>Loading...</div>) : null}
                            <Button label={"Set Password"} condition={"positive"} onClick={handleSubmit} buttonType={"submit"} isDisabled={isSubmitting} />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
