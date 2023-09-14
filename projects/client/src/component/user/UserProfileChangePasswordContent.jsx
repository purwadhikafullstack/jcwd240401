import React, {useState} from 'react'
import { useFormik } from 'formik'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { HiEye } from 'react-icons/hi'
import AlertPopUp from '../AlertPopUp'
import InputField from '../InputField'
import Button from '../Button'
import { changePasswordSchema } from '../../helpers/validationSchema'
import Modal from '../Modal'

export default function UserProfileChangePasswordContent() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const token = localStorage.getItem("token")
    const navigate = useNavigate()

    const onSubmit = async(values, actions) => {
        try{
            actions.setSubmitting(true)
            setIsLoading(true)
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/users/change-password`, values, {
                headers: {"Authorization" : `Bearer ${token}`}
            })
            if (response.status === 200){
                actions.resetForm()
                actions.setSubmitting(false)
                setIsLoading(false)
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
                handleShowAlert()
            }
        }catch(error){
            if(error.response.status === 500){
                setErrorMessage("Login failed: Server error")
            }else if(error.response?.data?.message){
                setErrorMessage(error.response?.data?.message)
            }
            actions.setSubmitting(false)
            setIsLoading(false)
            handleShowAlert()
        }
    }
    const {values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting} = useFormik({
        initialValues: {
            currentPassword: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema: changePasswordSchema,
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
    <div className='py-4 px-2 flex flex-col w-full sm:max-w-3xl mx-auto gap-4 justify-center font-inter'>
            <div>
                <div className='flex sticky top-0 sm:static bg-white py-3 lg:pt-10'>
                    <div className="grid justify-center content-center"><Button condition={"back"} onClick={() => navigate(-1)} /></div>
                    <div className='text-xl sm:text-3xl sm:font-bold sm:text-maingreen sm:mx-auto px-6'>Change My Password</div>
                </div>
                {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert} />) : (null)}
                <div className='flex flex-col gap-2 py-6 mx-2 sm:mx-0'>
                <form onSubmit={handleSubmit} autoComplete="off" className="w-full flex flex-col gap-2">
                    <div className="w-full">
                        <div className="relative">
                            <label htmlFor="currentPassword" className="font-inter relative">Current Password</label>
                            <InputField value={values.currentPassword} id={"currentPassword"} type={showPassword ? "text" : "password"} onChange={handleChange} onBlur={handleBlur} className="relative"/>
                            <div className='absolute bottom-2 right-2'><HiEye className="w-6 h-6 text-darkgrey" onClick={togglePassword} /></div>
                        </div>
                        {errors.currentPassword && touched.currentPassword && <p className="text-reddanger text-sm font-inter">{errors.currentPassword}</p>}
                    </div>
                    <div className="w-full">
                        <div className="relative">
                            <label htmlFor="password" className="font-inter relative">New Password</label>
                            <InputField value={values.password} id={"password"} type={showPassword ? "text" : "password"} onChange={handleChange} onBlur={handleBlur} className="relative"/>
                            <div className='absolute bottom-2 right-2'><HiEye className="w-6 h-6 text-darkgrey" onClick={togglePassword} /></div>
                        </div>
                        {errors.password && touched.password && <p className="text-reddanger text-sm font-inter">{errors.password}</p>}
                    </div>
                    <div className="w-full">
                        <label htmlFor="confirmPassword" className="font-inter">Confirm New Password</label>
                        <InputField value={values.confirmPassword} id={"confirmPassword"} type={"password"} onChange={handleChange} onBlur={handleBlur}/>
                        {errors.confirmPassword && touched.confirmPassword && <p className="text-reddanger text-sm font-inter">{errors.confirmPassword}</p>}
                    </div>
                    <div className="mt-10 flex flex-col items-center gap-2">
                        {isLoading ? (<div className='text-sm text-maingreen font-inter'>Loading...</div>) : null}
                        <Modal isDisabled={isSubmitting} modalTitle={"Change Password"} toggleName={"Change Password"} content={`Are you sure you want to change your password?`} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeTwo={"submit"} onClickButton={handleSubmit}/>
                    </div>
                </form>
                </div>
            </div>
        </div>
  )
}