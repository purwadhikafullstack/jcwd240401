import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useFormik } from 'formik'
import background from '../../assets/BackgroundLeaves.jpg'
import InputField from '../../component/InputField'
import Modal from '../../component/Modal'
import groceereLogo from '../../assets/logo_Groceer-e.svg'
import registerPic from '../../assets/marketPic.png'
import { registerUserSchema } from '../../helpers/validationSchema'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import AlertHelper from '../../component/AlertHelper'
import { getAllProvinces, getAllCities } from '../../api/location'
import { registerUser } from '../../api/auth'

export default function UserRegister() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [provinceData, setProvinceData] = useState([])
    const [cityData, setCityData] = useState([])
    const [selectedProvince, setSelectedProvince] = useState("")
    const [selectedCity, setSelectedCity] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const getProvince = async () => {
        try {
            const response = await getAllProvinces()
            if (response.data) {
                setProvinceData(response.data?.data)
            }
        } catch (error) {
            if (error.response) {
                console.log(error.response.message)
            }
        }
    }

    const getCity = async () => {
        try {
            const response = await getAllCities(selectedProvince)
            if (response.data) {
                setCityData(response.data?.data)
            }
        } catch (error) {
            if (error.response) {
                console.log(error.response.message)
            }
        }
    }
    useEffect(() => {
        getProvince()
    }, [])

    useEffect(() => {
        getCity()
    }, [selectedProvince])

    const provinceOptions = provinceData.map((province) => province.province_name)
    const cityOptions = selectedProvince ? cityData.map((city) => `${city.city_name} (${city.postal_code})`) : []

    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true)
            setIsLoading(true)
            const response = await registerUser(values)
            if (response.status === 200) {
                actions.resetForm()
                actions.setSubmitting(false)
                setIsLoading(false)
                setErrorMessage("")
                setSelectedProvince("")
                setSelectedCity("")
                setSuccessMessage(response.data?.message)
            }
        } catch (error) {
            if (error.response.status === 500) {
                setErrorMessage("Register failed: Server error")
            } else if (error.response?.data?.message) {
                setErrorMessage(error.response?.data?.message)
            }
            actions.setSubmitting(false)
            setIsLoading(false)
        }
    }
    const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, isValid, isSubmitting } = useFormik({
        initialValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            province: "",
            city: "",
            streetName: "",
            referralCode: "",
        },
        validationSchema: registerUserSchema,
        onSubmit
    })

    const togglePassword = () => {
        setShowPassword(!showPassword);
    }
    return (
        <div className="absolute w-full min-h-screen bg-cover bg-center flex justify-center items-center" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
            <div className='w-auto flex flex-col gap-2'>
                <div className="mt-10 lg:mt-0">
                    <Link to="/"><img src={groceereLogo} alt="logo" /></Link>
                    <div className='font-inter font-bold'>Your go-to grocery shop</div>
                    <div className='text-3xl text-maingreen font-inter font-bold mt-10'>Register</div>
                    <div className="text-xs text-reddanger">* required</div>
                </div>
                <form onSubmit={handleSubmit} autoComplete="off" className='grid grid-row-3 lg:grid-cols-3 gap-10'>
                    <div className="w-72 flex flex-col gap-2 col-span-1">
                        <div className="font-inter text-xl text-maingreen">Account Details</div>
                        <div className="w-full">
                            <label htmlFor="name" className="font-inter">Name <span className="text-reddanger font-normal">*</span></label>
                            <InputField value={values.name} id={"name"} type={"string"} onChange={handleChange} onBlur={handleBlur} />
                            {errors.name && touched.name && <p className="text-reddanger text-sm font-inter">{errors.name}</p>}
                        </div>
                        <div className="w-full">
                            <label htmlFor="email" className="font-inter">Email <span className="text-reddanger font-normal">*</span></label>
                            <InputField value={values.email} id={"email"} type={"string"} onChange={handleChange} onBlur={handleBlur} />
                            {errors.email && touched.email && <p className="text-reddanger text-sm font-inter">{errors.email}</p>}
                        </div>
                        <div className="w-full">
                            <label htmlFor="phone" className="font-inter">Phone <span className="text-reddanger font-normal">*</span></label>
                            <InputField value={values.phone} id={"phone"} type={"string"} onChange={handleChange} onBlur={handleBlur} />
                            {errors.phone && touched.phone && <p className="text-reddanger text-sm font-inter">{errors.phone}</p>}
                        </div>
                        <div className="w-full">
                            <div className='relative'>
                                <label htmlFor="password" className="font-inter relative">Password <span className="text-reddanger font-normal">*</span></label>
                                <InputField value={values.password} id={"password"} type={showPassword ? "text" : "password"} onChange={handleChange} onBlur={handleBlur} className="relative" />
                                <div className='absolute bottom-2 right-2 cursor-pointer'>{showPassword ? (<HiEyeOff className='h-6 w-6 text-darkgrey' onClick={togglePassword} />) : (<HiEye className='h-6 w-6 text-darkgrey' onClick={togglePassword} />)}</div>
                            </div>
                            {errors.password && touched.password && <p className="text-reddanger text-sm font-inter">{errors.password}</p>}
                        </div>
                        <div className="w-full">
                            <label htmlFor="confirmPassword" className="font-inter">Confirm Password <span className="text-reddanger font-normal">*</span></label>
                            <InputField value={values.confirmPassword} id={"confirmPassword"} type={"password"} onChange={handleChange} onBlur={handleBlur} />
                            {errors.confirmPassword && touched.confirmPassword && <p className="text-reddanger text-sm font-inter">{errors.confirmPassword}</p>}
                        </div>
                    </div>
                    <div className="w-72 flex flex-col justify-between col-span-1">
                        <div className="w-full flex flex-col gap-2">
                            <div className="font-inter text-xl text-maingreen">Address Details</div>
                            <div className="w-full">
                                <label htmlFor="province" className="font-inter">Province <span className="text-reddanger font-normal">*</span></label>
                                <select id="province" value={selectedProvince} name="province" onChange={(e) => { setSelectedProvince(e.target.value); setFieldValue('province', e.target.value) }} className="w-full h-10 bg-lightgrey font-inter rounded-md">
                                    <option value="">--Choose a Province--</option>
                                    {provinceOptions.map((options) => (
                                        <option value={options}>{options}</option>
                                    ))}
                                </select>
                                {errors.province && touched.province && <p className="text-reddanger text-sm font-inter">{errors.province}</p>}
                            </div>
                            <div className="w-full">
                                <label htmlFor="city" className="font-inter">City <span className="text-reddanger font-normal">*</span></label>
                                <select id="city" value={selectedCity} name="city" onChange={(e) => { setSelectedCity(e.target.value); setFieldValue('city', e.target.value) }} className="w-full h-10 bg-lightgrey font-inter rounded-md">
                                    <option value="">--Select a City--</option>
                                    {cityOptions.map((options) => (
                                        <option value={options}>{options}</option>
                                    ))}
                                </select>
                                {errors.city && touched.city && <p className="text-reddanger text-sm font-inter">{errors.city}</p>}
                            </div>
                            <div className="w-full">
                                <label htmlFor="streetName" className="font-inter">Street Address <span className="text-reddanger font-normal">*</span></label>
                                <InputField value={values.streetName} id={"streetName"} type={"string"} onChange={handleChange} onBlur={handleBlur} />
                                {errors.streetName && touched.streetName && <p className="text-reddanger text-sm font-inter">{errors.streetName}</p>}
                            </div>
                        </div>
                        <div className='mt-10 lg:mt-0 flex flex-col gap-2'>
                            <div className="font-inter text-xl text-maingreen">Referral Code</div>
                            <div className="w-full">
                                <label htmlFor="referralCode" className="font-inter">Have a referral code? Type it in to get special promotions</label>
                                <InputField value={values.referralCode} id={"referralCode"} type={"string"} onChange={handleChange} onBlur={handleBlur} />
                                {errors.referralCode && touched.referralCode && <p className="text-reddanger text-sm font-inter">{errors.referralCode}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="w-72 flex flex-col col-span-1 justify-between">
                        <div className="w-full h-40 ">
                            <img src={registerPic} alt="register" className="w-full max-h-40 object-cover" />
                        </div>
                        <div className='mt-10 lg:mt-0 flex flex-col items-center gap-2'>
                            <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
                            {isLoading ? (<div className='text-sm text-maingreen font-inter'>Loading...</div>) : null}
                            <Modal isDisabled={!isValid || isSubmitting} modalTitle={"Register"} toggleName={"Register"} content={"Are you sure you have filled the details correctly?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeTwo={"submit"} onClickButton={handleSubmit} />
                            <Link to="/login" className="font-inter text-sm font-bold text-maingreen">Back To Log In</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
