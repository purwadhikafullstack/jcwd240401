import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFormik } from 'formik'
import background from '../assets/BackgroundLeaves.jpg'
import InputField from '../component/InputField'
import Modal from '../component/Modal'
import groceereLogo from '../assets/logo_Groceer-e.svg'
import forgotPasswordImage from '../assets/Forgot password.png'
import { forgotPasswordSchema } from '../helpers/validationSchema'
import AlertHelper from '../component/AlertHelper'
import { forgotPassword } from '../api/auth'

export default function Login() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true)
            setIsLoading(true)
            const response = await forgotPassword(values)
            if (response.status === 200) {
                actions.resetForm()
                actions.setSubmitting(false)
                setIsLoading(false)
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
            }
        } catch (error) {
            if (error.response.status === 500) {
                setErrorMessage("Can't send email: Server error")
            } else if (error.response?.data?.message) {
                setErrorMessage(error.response?.data?.message)
            }
            actions.setSubmitting(false)
            setIsLoading(false)
        }
    }
    const { values, errors, touched, handleChange, handleBlur, handleSubmit, isValid, isSubmitting } = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: forgotPasswordSchema,
        onSubmit
    })

    return (
        <>
            <div className="absolute w-full min-h-screen bg-cover bg-center flex justify-center items-center" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
                <div className="lg:w-2/3 lg:grid lg:grid-cols-2">
                    <div className="hidden lg:flex lg:flex-col lg:gap-2 lg:justify-start lg:items-start lg:w-full">
                        <img src={groceereLogo} alt="logo" />
                        <div className='font-inter font-bold'>Your go-to grocery shop</div>
                        <div className='text-3xl text-maingreen font-inter font-bold mt-10'>Forgot Password</div>
                        <img src={forgotPasswordImage} alt="set password illustration" className='w-80 h-80' />
                    </div>
                    <div className="flex justify-center flex-col gap-2 items-center">
                        <div className="mb-10 lg:hidden flex flex-col justify-center items-center">
                            <img src={groceereLogo} alt="logo" className='mb-6' />
                            <div className='text-2xl text-maingreen font-inter font-bold'>Forgot Password</div>
                            <img src={forgotPasswordImage} alt="logo" className="w-52 h-52" />
                        </div>
                        <div className="w-72">
                            <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
                        </div>
                        <form onSubmit={handleSubmit} autoComplete="off" className="w-72 flex flex-col gap-2">
                            <div className="w-full">
                                <label htmlFor="email" className="font-inter">Email</label>
                                <InputField value={values.email} id={"email"} type={"string"} onChange={handleChange} onBlur={handleBlur} />
                                {errors.email && touched.email && <p className="text-reddanger text-sm font-inter">{errors.email}</p>}
                            </div>
                            <div className="mt-10 flex flex-col items-center gap-2">
                                {isLoading ? (<div className='text-sm text-maingreen font-inter'>Loading...</div>) : null}
                                <Modal isDisabled={!isValid || isSubmitting} modalTitle={"Send Reset Password Link"} toggleName={"Send Reset Password Link"} content={`Send reset password link to ${values.email}?`} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeTwo={"submit"} onClickButton={handleSubmit} />
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
