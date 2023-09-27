import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux'

import Modal from '../Modal';
import InputField from '../InputField';
import Button from '../Button';
import { createAddressSchema } from '../../helpers/validationSchema';
import AlertHelper from '../AlertHelper';
import { createAddress } from '../../api/profile';

export default function UserAddressCreateContent() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [provinceData, setProvinceData] = useState([])
    const [cityData, setCityData] = useState([])
    const [selectedProvince, setSelectedProvince] = useState("")
    const [selectedCity, setSelectedCity] = useState("")
    const navigate = useNavigate()
    const profile = useSelector((state) => state.auth.profile)
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
        try {
            const response = await createAddress(token, values)
            if (response.status === 201) {
                resetForm()
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
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
            if (response.data.message == "You already have the maximum number of addresses (5)") {
                setStatus({ success: false, msg: "You already have the maximum number of addresses (5)" });
                setErrorMessage(`You already have the maximum number of addresses (5)`)
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
            resetForm()
        } finally {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setSubmitting(false);
        }
    };

    useEffect(() => {
        window.scroll({ top: 0, behavior: 'smooth' })
        if (!selectedProvince) {
            getProvince()
        } else {
            getCity()
        }
    }, [selectedProvince, successMessage])

    return (
        <div className='sm:py-4 px-2 flex flex-col font-inter w-full sm:max-w-3xl lg:justify-center mx-auto'>
            <div className='flex sticky top-0 z-10 sm:static bg-white py-3 lg:pt-10'>
                <div className="grid justify-center content-center"><Button condition={"back"} onClick={() => navigate(-1)} /></div>
                <div className='text-xl sm:text-3xl sm:font-bold sm:text-maingreen px-6'>Add New Address</div>
            </div>
            <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
            <Formik initialValues={{ receiver: "", contact: "", streetName: "", province: "", city: "", addressLabel: "Home", isMain: false }} validationSchema={createAddressSchema} onSubmit={handleSubmit}>
                {(props) => (
                    <Form className='mx-4 pb-6 sm:py-6'>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="receiver" className="font-medium">Receiver <span className="text-xs text-reddanger font-normal">* required</span></label>
                            <div className='relative'>
                                <InputField value={props.values.receiver} id={"receiver"} type={"string"} name="receiver" onChange={props.handleChange} placeholder={profile.name} />
                                {props.errors.receiver && props.touched.receiver && <div className="text-sm text-reddanger absolute top-12">{props.errors.receiver}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="contact" className="font-medium">Phone Number <span className="text-xs text-reddanger font-normal">* required</span></label>
                            <div className='relative'>
                                <InputField value={props.values.contact} id={"contact"} type={"string"} name="contact" onChange={props.handleChange} placeholder={profile.phone} />
                                {props.errors.contact && props.touched.contact && <div className="text-sm text-reddanger absolute top-12">{props.errors.contact}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="streetName" className="font-medium">Address Details <span className="text-xs text-reddanger font-normal">* required</span></label>
                            <div className='relative'>
                                <InputField value={props.values.streetName} id={"streetName"} type={"string"} name="streetName" onChange={props.handleChange} />
                                {props.errors.streetName && props.touched.streetName && <div className="text-sm text-reddanger absolute top-12">{props.errors.streetName}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="province" className="font-medium">Province <span className="text-xs text-reddanger font-normal">* required</span></label>
                            <div className='relative'>
                                <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='province' onChange={(e) => { setSelectedProvince(e.target.value); props.setFieldValue('province', e.target.value) }}>
                                    <option key="empty" value=''>--choose a province--</option>
                                    {provinceData && provinceData.map((province) => (
                                        <option key={province.label} value={province.value}>{province.label}</option>
                                    ))}
                                </Field>
                                {props.errors.province && props.touched.province && <div className="text-sm text-reddanger absolute top-12">{props.errors.province}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="city" className="font-medium">City <span className="text-xs text-reddanger font-normal">* required</span></label>
                            <div className='relative'>
                                <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='city' onChange={(e) => { setSelectedCity(e.target.value); props.setFieldValue('city', e.target.value) }} >
                                    <option key="empty" value=''>--choose a city--</option>
                                    {cityData.map((city) => (<option key={city.label} value={city.value}>{city.label}</option>))}
                                </Field>
                                {props.errors.city && props.touched.city && <div className="text-sm text-reddanger absolute top-12">{props.errors.city}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="addressLabel" className="font-medium">Label As: <span className="text-xs text-reddanger font-normal">* required</span></label>
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
                                <label htmlFor="isMain" className="relative inline-flex items-center font-medium">Set as Main Address</label>
                                <div className={`mx-2 w-8 h-5 bg-gray-200 rounded-full relative transition-colors duration-300 ${props.values.isMain ? 'bg-maindarkgreen' : ''}`} onClick={() => { props.setFieldValue("isMain", !props.values.isMain); }}>
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