import React, {useState, useEffect} from 'react'
import {useFormik} from 'formik'
import axios from 'axios'
import { registerSchema } from '../../../../helpers/validationSchema'
import AlertPopUp from '../../../AlertPopUp'
import InputField from '../../../InputField'
import Dropdown from '../../../Dropdown'
import Modal from '../../../Modal'

export default function CreateBranch() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [provinceData, setProvinceData] = useState([])
    const [cityData, setCityData] = useState([])
    const [selectedProvince, setSelectedProvince] = useState("")
    const [selectedCity, setSelectedCity] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const token = localStorage.getItem("token")

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
            const response = await axios.post("http://localhost:8000/api/auth/admins/register", values, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            if (response.status === 200){
                actions.resetForm()
                setErrorMessage("")
                setSelectedProvince("")
                setSelectedCity("")
                handleShowAlert()
                setSuccessMessage(response.data?.message)
            }
        }catch(error){
            if(error.response.status === 500){
                setErrorMessage("Add admin failed: Server error")
            }else if(error.response?.data?.message === "There's already an admin with this email"){
                setErrorMessage("There's already an admin with this email")
            }else if(error.response?.data?.message === "There's already a branch in this city"){
                setErrorMessage("There's already a branch in this city")
            }else if(error.response?.data?.message === "There is no city in the selected province"){
                setErrorMessage("There is no city in the selected province")
            }
            handleShowAlert()
        }
    }
    const {values, errors, touched, handleChange, handleBlur, handleSubmit} = useFormik({
        initialValues: {
            name: "",
            email: "",
            phone: "",
            province: "",
            city: "",
        },
        validationSchema: registerSchema,
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
                <div className='w-full h-full flex justify-center items-center'>
                    <div className="lg:w-1/2 w-72 flex flex-col gap-2">
                        <div className="w-full">
                            {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert}/>) : (null)}
                        </div>
                        <form onSubmit={(e) => {e.preventDefault(); handleSubmit(e)}} autoComplete="off" className="w-full flex flex-col gap-2">
                            <div className="w-full">
                                <label htmlFor="name" className="font-inter">Name</label>
                                <InputField value={values.name} id={"name"} type={"string"} onChange={handleChange} onBlur={handleBlur} autoComplete="off"/>
                                {errors.name && touched.name && <p className="text-reddanger text-sm font-inter">{errors.name}</p>}
                            </div>
                            <div className="w-full">
                                <label htmlFor="email" className="font-inter">Email</label>
                                <InputField value={values.email} id={"email"} type={"string"} onChange={handleChange} onBlur={handleBlur} autoComplete="off"/>
                                {errors.email && touched.email && <p className="text-reddanger text-sm font-inter">{errors.email}</p>}
                            </div>
                            <div className="w-full">
                                <label htmlFor="phone" className="font-inter">Phone</label>
                                <InputField value={values.phone} id={"phone"} type={"string"} onChange={handleChange} onBlur={handleBlur} autoComplete="off"/>
                                {errors.phone && touched.phone && <p className="text-reddanger text-sm font-inter">{errors.phone}</p>}
                            </div>
                            <div className="w-full flex flex-col">
                                <label htmlFor="province" className="font-inter">Province</label>
                                <Dropdown options={provinceOptions} id="province" placeholder={"Choose a province"} onChange={(value) => {
                                    setSelectedProvince(value);
                                    handleChange("province")(value)
                                }}/>
                                {errors.province && touched.province && <p className="text-reddanger text-sm font-inter">{errors.province}</p>}
                            </div>
                            <div className="w-full flex flex-col">
                            <label htmlFor="city" className="font-inter">City</label>
                                <Dropdown options={cityOptions} id="city" placeholder={"Choose a city"} onChange={(value) => {
                                    setSelectedCity(value)
                                    handleChange("city")(value)}}/>
                                {errors.city && touched.city && <p className="text-reddanger text-sm font-inter">{errors.city}</p>}
                            </div>
                            <div className="mt-10">
                                <Modal modalTitle={"Add Branch Admin"} toggleName={"Add Branch Admin"} content={`Are you sure to add ${values.name} (${values.email}) as branch admin at ${values.city}, ${values.province}?`} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} onClickButton={handleSubmit}/>
                            </div>
                        </form>
                    </div>
                </div>
        </>
    )
}
