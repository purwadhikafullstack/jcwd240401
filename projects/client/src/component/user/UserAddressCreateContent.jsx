import React, { useState, useEffect } from 'react';
import * as yup from "yup";
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from 'react-redux'

import Modal from '../Modal';
import InputField from '../InputField';
import AlertPopUp from '../AlertPopUp';
import Button from '../Button';

export default function UserAddressCreateContent() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [provinceData, setProvinceData] = useState([])
    const [cityData, setCityData] = useState([])
    const [selectedProvince, setSelectedProvince] = useState("")
    const [selectedCity, setSelectedCity] = useState("")
    const navigate = useNavigate()

    const goBack = () => {
        navigate(-1);
    };
    const validRgx = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
    const profile = useSelector((state) => state.auth.profile)

    const createAddressSchema = yup.object().shape({
        receiver: yup.string().trim().required("Receiver is required").max(50, "Maximum character is 50").typeError("Receiver must be a valid text"),
        contact: yup.string().required('Contact is required').matches(validRgx, "Contact is not valid"),
        streetName: yup.string().trim().required("Street name is required").max(255, "Maximum character is 255").typeError("Street name must be a valid text"),
        province: yup.string().required("Province is required"),
        city: yup.string().required("City is required"),
        addressLabel: yup.string().required("Address label is required"),
    });

    const token = localStorage.getItem("token")
    const getProvince = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/all-province`)
            if (response.data) {
                const data = response?.data?.data;
                if (data) {
                    setProvinceData(data.map(province => ({ label: province.province_name })));
                } else {
                    setProvinceData([]);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }
    const getCity = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/all-city?province=${selectedProvince}`)
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    setCityData(data.map(city => ({ label: `${city.city_name} (${city.postal_code})`, value: city.city_name })));
                } else {
                    setCityData([]);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }
    const handleSubmit = async (values, { setSubmitting, resetForm, setStatus }) => {
        console.log(values)
        console.log("berhasil click submit")
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/address`, values, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (response.status === 201) {
                resetForm()
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
                handleShowAlert()
            }
        } catch (error) {
            console.log(error)
            const response = error.response;
            if (response.data.message === "An error occurs") {
                const { msg } = response.data?.errors[0];
                if (msg) {
                    setStatus({ success: false, msg });
                    setErrorMessage(`${msg}`)
                }
            }
            if (response.data.message == "An address with similar details already exists") {
                setStatus({ success: false, msg: "An address with similar details already exists" });
                setErrorMessage(`An address with similar details already exists`)
            }
            if (response.data.error) {
                const errMsg = response.data.error;
                console.log(errMsg)
                setStatus({ success: false, errors: errMsg });
                setErrorMessage(`${errMsg}`);
            }
            if (response.status === 500) {
                setErrorMessage("Create address failed: Server error")
            }
            handleShowAlert()
            resetForm()
        } finally {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setSubmitting(false);
        }
    };

    const handleShowAlert = () => {
        setShowAlert(true)
        setTimeout(() => {
            setShowAlert(false)
        }, 4000)
    }
    const handleHideAlert = () => {
        setShowAlert(false)
    }

    useEffect(() => {
        if (!selectedProvince) {
            getProvince()
        } else {
            getCity()
        }
    }, [selectedProvince, successMessage])

    return (
        <div className='py-4 px-2 flex flex-col font-inter w-full sm:max-w-3xl mx-auto'>
            <div className='flex'>
                <div className="grid justify-center content-center"><Button condition={"back"} onClick={goBack} /></div>
                <div className='text-xl sm:text-3xl sm:font-bold sm:text-maingreen px-6'>Add New Address</div>
            </div>
            {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert} />) : (null)}
            <Formik initialValues={{ receiver: "", contact: "", streetName: "", province: "", city: "", addressLabel: "Home", isMain: false }} validationSchema={createAddressSchema} onSubmit={handleSubmit}>
                {(props) => (
                    <Form className='mx-4'>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="receiver" className="">Receiver <span className="text-xs text-reddanger">* required</span></label>
                            <div className='relative'>
                                <InputField value={props.values.receiver} id={"receiver"} type={"string"} name="receiver" onChange={props.handleChange} placeholder={profile.name} />
                                {props.errors.receiver && props.touched.receiver && <div className="text-sm text-reddanger absolute top-12">{props.errors.receiver}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="contact" className="">Phone Number <span className="text-xs text-reddanger">* required</span></label>
                            <div className='relative'>
                                <InputField value={props.values.contact} id={"contact"} type={"string"} name="contact" onChange={props.handleChange} placeholder={profile.phone} />
                                {props.errors.contact && props.touched.contact && <div className="text-sm text-reddanger absolute top-12">{props.errors.contact}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="streetName" className="">Address Details <span className="text-xs text-reddanger">* required</span></label>
                            <div className='relative'>
                                <InputField value={props.values.streetName} id={"streetName"} type={"string"} name="streetName" onChange={props.handleChange} />
                                {props.errors.streetName && props.touched.streetName && <div className="text-sm text-reddanger absolute top-12">{props.errors.streetName}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="province" className="">Province <span className="text-xs text-reddanger">* required</span></label>
                            <div className='relative'>
                                <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='province' onChange={(e) => { setSelectedProvince(e.target.value); props.setFieldValue('province', e.target.value) }}>
                                    <option key="empty" value=''>--choose a province--</option>
                                    {provinceData && provinceData.map((province) => (
                                        <option key={province.label} value={province.value}>
                                            {province.label}
                                        </option>
                                    ))}
                                </Field>
                                {props.errors.province && props.touched.province && <div className="text-sm text-reddanger absolute top-12">{props.errors.province}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="city" className="">City <span className="text-xs text-reddanger">* required</span></label>
                            <div className='relative'>
                                <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='city' onChange={(e) => { setSelectedCity(e.target.value); props.setFieldValue('city', e.target.value) }} >
                                    <option key="empty" value=''>--choose a city--</option>
                                    {cityData.map((city) => (
                                        <option key={city.label} value={city.value}>
                                            {city.label}
                                        </option>
                                    ))}
                                </Field>
                                {props.errors.city && props.touched.city && <div className="text-sm text-reddanger absolute top-12">{props.errors.city}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="addressLabel" className="">Label As: <span className="text-xs text-reddanger">* required</span></label>
                            <div className='relative'>
                                <label>
                                    <Field type="radio" name="addressLabel" value={"Home"} checked={props.values.addressLabel === "Home"} onChange={() => props.setFieldValue("addressLabel", "Home")} className=" checked:bg-maingreen mx-2 focus:ring-0" id="Home" />
                                    Home
                                </label>
                                <label>
                                    <Field type="radio" name="addressLabel" value={"Work"} checked={props.values.addressLabel === "Work"} onChange={() => props.setFieldValue("addressLabel", "Work")} className=" checked:bg-maingreen mx-2 focus:ring-0" id="Work" />
                                    Work
                                </label>
                                {props.errors.addressLabel && props.touched.addressLabel && <div className="text-sm text-reddanger absolute top-12">{props.errors.addressLabel}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <div className='flex items-center'>
                                <label htmlFor="isMain" className="relative inline-flex items-center">
                                    Set as Main Address
                                </label>
                                <div className={`mx-2 w-8 h-5 bg-gray-200 rounded-full relative transition-colors duration-300 ${props.values.isMain ? 'bg-maindarkgreen' : ''}`}
                                    onClick={() => {
                                        props.setFieldValue("isMain", !props.values.isMain);
                                    }}
                                >
                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 left-${props.values.isMain ? '4' : '1'} transition-all duration-300`}></div>
                                </div>
                                {props.errors.isMain && props.touched.isMain && <div className="text-sm text-reddanger absolute top-12">{props.errors.isMain}</div>}
                            </div>
                        </div>
                        <div className="mt-8">
                            <Modal isDisabled={!props.dirty || !props.isValid} modalTitle={"Add New Address"} toggleName={"Add New Address"} content={"By adding the new address, you're providing information for future use. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} />
                        </div>
                    </Form >
                )}
            </Formik >
        </div >
    )
}
