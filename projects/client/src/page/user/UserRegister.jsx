import React, {useState, useEffect} from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {useFormik} from 'formik'
import axios from 'axios'
import background from '../../assets/BackgroundLeaves.jpg'
import InputField from '../../component/InputField'
import Modal from '../../component/Modal'
import groceereLogo from '../../assets/logo_Groceer-e.svg'
import registerPic from '../../assets/marketPic.png'
import { registerUserSchema } from '../../helpers/validationSchema'
import AlertPopUp from '../../component/AlertPopUp'
import Dropdown from '../../component/Dropdown'

export default function UserRegister() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [provinceData, setProvinceData] = useState([])
    const [cityData, setCityData] = useState([])
    const [selectedProvince, setSelectedProvince] = useState("")
    const [selectedCity, setSelectedCity] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        try{
            axios.get("http://localhost:8000/api/auth/all-province").then((response) => {setProvinceData(response.data?.data)})
        }catch(error){
            console.log(error)
        }
    }, [])

    useEffect(() => {
        try{
            axios.get(`http://localhost:8000/api/auth/all-city?province=${selectedProvince}`).then((response) => {setCityData(response.data?.data)})
        }catch(error){
            console.log(error)
        }
    }, [selectedProvince])

    const provinceOptions = provinceData.map((province) => province.province_name)
    const cityOptions = selectedProvince ? cityData.map((city) => city.city_name) : []
    
    const onSubmit = async(values, actions) => {
        try{
            const response = await axios.post("http://localhost:8000/api/auth/users/register", values, {
                headers: {"Content-Type" : "application/json"}
            })
            if (response.status === 200){
                actions.resetForm()
                setErrorMessage("")
                setSelectedCity(cityOptions[0])
                setSuccessMessage(response.data?.message)
                handleShowAlert()
            }
        }catch(error){
            if(error.response.status === 500){
                setErrorMessage("Register failed: Server error")
            }else if(error.response?.data?.message === "There's already an account with this email"){
                setErrorMessage("There's already an account with this email")
            }else if(error.response?.data?.message === "There's already an account with this phone number"){
                setErrorMessage("There's already an account with this phone number")
            }else if(error.response?.data?.message === "Password doesn't match"){
                setErrorMessage("Password doesn't match")
            }else if(error.response?.data?.message === "There is no city in the selected province"){
                setErrorMessage("There is no city in the selected province")
            }else if(error.response?.data?.message === "Can't get location's latitude and longitude"){
                setErrorMessage("Can't get location's latitude and longitude")
            }
            handleShowAlert()
        }
    }
    const {values, errors, touched, handleChange, handleBlur, handleSubmit} = useFormik({
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

    const handleShowAlert = () => {
        setShowAlert(true)
    }

    const handleHideAlert = () => {
        setShowAlert(false)
    }

    return (
        <>
        <div className="absolute w-full min-h-screen bg-cover bg-center flex justify-center items-center" style={{backgroundImage: `url(${background})`, backgroundSize: 'cover'}}>
            <div className='w-auto flex flex-col gap-2'>
                <div>
                    <img src={groceereLogo} alt="logo" />
                    <div className='font-inter font-bold'>Your go-to grocery shop</div>
                    <div className='text-3xl text-maingreen font-inter font-bold mt-10'>Register</div>
                </div>
                <form onSubmit={handleSubmit} autoComplete="off"  className='grid grid-cols-3 gap-10'>
                    <div className="w-72 flex flex-col gap-2 col-span-1">
                        <div className="font-inter text-xl text-maingreen">Account Details</div>
                        <div className="w-full">
                            <label htmlFor="name" className="font-inter">Name</label>
                            <InputField value={values.name} id={"name"} type={"string"} onChange={handleChange} onBlur={handleBlur}/>
                            {errors.name && touched.name && <p className="text-reddanger text-sm font-inter">{errors.name}</p>}
                        </div>
                        <div className="w-full">
                            <label htmlFor="email" className="font-inter">Email</label>
                            <InputField value={values.email} id={"email"} type={"string"} onChange={handleChange} onBlur={handleBlur}/>
                            {errors.email && touched.email && <p className="text-reddanger text-sm font-inter">{errors.email}</p>}
                        </div>
                        <div className="w-full">
                            <label htmlFor="phone" className="font-inter">Phone</label>
                            <InputField value={values.phone} id={"phone"} type={"string"} onChange={handleChange} onBlur={handleBlur}/>
                            {errors.phone && touched.phone && <p className="text-reddanger text-sm font-inter">{errors.phone}</p>}
                        </div>
                        <div className="w-full">
                            <label htmlFor="password" className="font-inter">Password</label>
                            <InputField value={values.password} id={"password"} type={"password"} onChange={handleChange} onBlur={handleBlur}/>
                            {errors.password && touched.password && <p className="text-reddanger text-sm font-inter">{errors.password}</p>}
                        </div>
                        <div className="w-full">
                            <label htmlFor="confirmPassword" className="font-inter">Confirm Password</label>
                            <InputField value={values.confirmPassword} id={"confirmPassword"} type={"password"} onChange={handleChange} onBlur={handleBlur}/>
                            {errors.confirmPassword && touched.confirmPassword && <p className="text-reddanger text-sm font-inter">{errors.confirmPassword}</p>}
                        </div>
                    </div>
                    <div className="w-72 flex flex-col justify-between col-span-1">
                        <div className="w-full flex flex-col gap-2">
                        <div className="font-inter text-xl text-maingreen">Address Details</div>
                        <div className="w-full">
                            <label htmlFor="province" className="font-inter">Province</label>
                            <Dropdown options={provinceOptions} id="province" placeholder={"Choose a province"} onChange={(value) => {
                            setSelectedProvince(value);
                            handleChange("province")(value)
                            }}/>
                            {errors.province && touched.province && <p className="text-reddanger text-sm font-inter">{errors.province}</p>}
                        </div>
                        <div className="w-full">
                            <label htmlFor="city" className="font-inter">City</label>
                            <Dropdown isClearable={true} options={cityOptions} id="city" placeholder={"Choose a city"} onChange={(value) => {
                            setSelectedCity(value)
                            handleChange("city")(value)}}/>
                            {errors.city && touched.city && <p className="text-reddanger text-sm font-inter">{errors.city}</p>}
                        </div>
                        <div className="w-full">
                            <label htmlFor="streetName" className="font-inter">Street Address</label>
                            <InputField value={values.streetName} id={"streetName"} type={"string"} onChange={handleChange} onBlur={handleBlur}/>
                            {errors.streetName && touched.streetName && <p className="text-reddanger text-sm font-inter">{errors.streetName}</p>}
                        </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <div className="font-inter text-xl text-maingreen">Referal Code</div>
                            <div className="w-full">
                                <label htmlFor="referralCode" className="font-inter">Have a referal code? Type it in to get special promotions</label>
                                <InputField value={values.referralCode} id={"referralCode"} type={"string"} onChange={handleChange} onBlur={handleBlur}/>
                                {errors.referralCode && touched.referralCode && <p className="text-reddanger text-sm font-inter">{errors.referralCode}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="w-72 flex flex-col col-span-1 justify-between">
                        <div className="w-full h-40 ">
                            <img src={registerPic} alt="register" className="w-full max-h-40 object-cover" />
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert}/>) : (null)}
                            <Modal modalTitle={"Register"} toggleName={"Register"} content={"Are you sure you have filled the details correctly?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} onClickButton={handleSubmit}/>
                            <Link to="/login" className="font-inter text-sm font-bold text-maingreen">Back To Log In</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        </>
    )
}
