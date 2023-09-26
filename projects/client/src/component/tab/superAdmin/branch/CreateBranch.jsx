import React, { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import { registerAdminSchema } from '../../../../helpers/validationSchema'
import InputField from '../../../InputField'
import Modal from '../../../Modal'
import AlertHelper from '../../../AlertHelper'
import { getAllProvinces, getAllCities } from '../../../../api/location'
import { createBranch } from '../../../../api/auth'

export default function CreateBranch() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [provinceData, setProvinceData] = useState([])
    const [cityData, setCityData] = useState([])
    const [selectedProvince, setSelectedProvince] = useState("")
    const [selectedCity, setSelectedCity] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const token = localStorage.getItem("token")

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
            const response = await createBranch(token, values)
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
        } finally {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, isValid, isSubmitting, dirty } = useFormik({
        initialValues: {
            name: "",
            email: "",
            phone: "",
            province: "",
            city: "",
            streetName: "",
        },
        validationSchema: registerAdminSchema,
        onSubmit
    })

    return (
        <>
            <div className='w-full h-full flex justify-center items-center'>
                <div className="w-full sm:w-8/12 flex flex-col gap-2">
                    <div className="w-full">
                        <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e) }} autoComplete="off" className="w-full flex flex-col gap-2">
                        <div className="text-xs text-reddanger">* required</div>
                        <div className="w-full">
                            <label htmlFor="name" className="font-inter">Name <span className="text-reddanger">*</span></label>
                            <InputField value={values.name} id={"name"} type={"string"} onChange={handleChange} onBlur={handleBlur} autoComplete="off" />
                            {errors.name && touched.name && <p className="text-reddanger text-sm font-inter">{errors.name}</p>}
                        </div>
                        <div className="w-full">
                            <label htmlFor="email" className="font-inter">Email <span className="text-reddanger">*</span></label>
                            <InputField value={values.email} id={"email"} type={"string"} onChange={handleChange} onBlur={handleBlur} autoComplete="off" />
                            {errors.email && touched.email && <p className="text-reddanger text-sm font-inter">{errors.email}</p>}
                        </div>
                        <div className="w-full">
                            <label htmlFor="phone" className="font-inter">Phone <span className="text-reddanger">*</span></label>
                            <InputField value={values.phone} id={"phone"} type={"string"} onChange={handleChange} onBlur={handleBlur} autoComplete="off" />
                            {errors.phone && touched.phone && <p className="text-reddanger text-sm font-inter">{errors.phone}</p>}
                        </div>
                        <div className="w-full flex flex-col">
                            <label htmlFor="province" className="font-inter">Province <span className="text-reddanger">*</span></label>
                            <select id="province" value={selectedProvince} name="province" onChange={(e) => { setSelectedProvince(e.target.value); setFieldValue('province', e.target.value) }} className="w-full h-10 bg-lightgrey font-inter rounded-md">
                                <option value="">--Choose a Province--</option>
                                {provinceOptions.map((options) => (
                                    <option value={options}>{options}</option>
                                ))}
                            </select>
                            {errors.province && touched.province && <p className="text-reddanger text-sm font-inter">{errors.province}</p>}
                        </div>
                        <div className="w-full flex flex-col">
                            <label htmlFor="city" className="font-inter">City <span className="text-reddanger">*</span></label>
                            <select id="city" value={selectedCity} name="city" onChange={(e) => { setSelectedCity(e.target.value); setFieldValue('city', e.target.value) }} className="w-full h-10 bg-lightgrey font-inter rounded-md">
                                <option value="">--Select a City--</option>
                                {cityOptions.map((options) => (
                                    <option value={options}>{options}</option>
                                ))}
                            </select>
                            {errors.city && touched.city && <p className="text-reddanger text-sm font-inter">{errors.city}</p>}
                        </div>
                        <div className="w-full">
                            <label htmlFor="streetName" className="font-inter">Street Address <span className="text-reddanger">*</span></label>
                            <InputField value={values.streetName} id={"streetName"} type={"string"} onChange={handleChange} onBlur={handleBlur} autoComplete="off" />
                            {errors.streetName && touched.streetName && <p className="text-reddanger text-sm font-inter">{errors.streetName}</p>}
                        </div>
                        <div className="mt-10 flex flex-col items-center gap-2">
                            {isLoading ? (<div className='text-sm text-maingreen font-inter'>Loading...</div>) : null}
                            <Modal isDisabled={!dirty || !isValid || isSubmitting} modalTitle={"Add Branch Admin"} toggleName={"Add Branch Admin"} content={`Are you sure to add ${values.name} (${values.email}) as branch admin at ${values.city}, ${values.province}?`} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeTwo={"submit"} onClickButton={handleSubmit} />
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
