import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import { useNavigate, useParams } from "react-router-dom";

import Modal from '../Modal';
import InputField from '../InputField';
import Button from '../Button';
import { modifyAddressSchema } from '../../helpers/validationSchema';
import AlertHelper from '../AlertHelper';
import { getAddressByName, modifyAddress } from '../../api/profile';

export default function UserAddressModifyContent() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [addressDetails, setAddressDetails] = useState({ receiver: "", contact: "", streetName: "", province: "", city: "", addressLabel: "", })
    const [provinceData, setProvinceData] = useState([])
    const [cityData, setCityData] = useState([])
    const [selectedProvince, setSelectedProvince] = useState("")
    const [selectedCity, setSelectedCity] = useState("")
    const { name } = useParams()
    const navigate = useNavigate()
    const token = localStorage.getItem("token")

    const getOneAddress = async () => {
        try {
            const response = await getAddressByName(token, name)
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    setAddressDetails({ id: data.id, receiver: data.receiver, contact: data.contact, streetName: data.streetName, province: data?.City?.Province?.province_name, city: data?.City?.city_name, addressLabel: data?.addressLabel, })
                } else {
                    setAddressDetails([]);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }

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
        const { receiver, contact, streetName, province, city, addressLabel } = values
        const data = {}
        if (streetName !== addressDetails.streetName || province !== addressDetails.province || city !== addressDetails.city) {
            data.streetName = streetName
            data.province = province
            data.city = city
        }
        if (receiver !== addressDetails.receiver) { data.receiver = receiver }
        if (contact !== addressDetails.contact) { data.contact = contact }
        if (addressLabel !== addressDetails.addressLabel) { data.addressLabel = addressLabel }
        try {
            const response = await modifyAddress(token, addressDetails.id, data)
            if (response.status === 200) {
                resetForm()
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
            }
        } catch (error) {
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
                setErrorMessage("Modify address failed: Server error")
            }
            resetForm()
        } finally {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setSubmitting(false);
            if (streetName !== addressDetails.streetName) { navigate(`/user/account/my-address/modify/${encodeURIComponent(data.streetName)}`) }
        }
    };

    useEffect(() => {
        getOneAddress()
        getProvince()
        getCity()
    }, [selectedProvince, successMessage])

    if (!addressDetails.streetName) {
        return <div className='grid justify-center text-maindarkgreen font-bold px-2'>Loading...</div>;
    }
    return (
        <div className='sm:py-4 px-2 flex flex-col font-inter w-full sm:max-w-3xl lg:justify-center mx-auto'>
            <div className='flex sticky top-0 z-10 sm:static bg-white py-3 lg:pt-10'>
                <div className="grid justify-center content-center"><Button condition={"back"} onClick={() => navigate("/user/account/my-address")} /></div>
                <div className='text-xl sm:text-3xl sm:font-bold sm:text-maingreen px-6'>Modify My Address</div>
            </div>
            <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
            <Formik enableReinitialize initialValues={{ receiver: addressDetails.receiver, contact: addressDetails.contact, streetName: addressDetails.streetName, province: addressDetails.province, city: addressDetails.city, addressLabel: addressDetails.addressLabel }} validationSchema={modifyAddressSchema} onSubmit={handleSubmit}>
                {(props) => (
                    <Form className='mx-4 pb-6 sm:py-6'>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="receiver" className="font-bold">Receiver</label>
                            <div className='relative'>
                                <InputField value={props.values.receiver} id={"receiver"} type={"string"} name="receiver" onChange={props.handleChange} />
                                {props.errors.receiver && props.touched.receiver && <div className="text-sm text-reddanger absolute top-12">{props.errors.receiver}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="contact" className="font-bold">Phone Number</label>
                            <div className='relative'>
                                <InputField value={props.values.contact} id={"contact"} type={"string"} name="contact" onChange={props.handleChange} />
                                {props.errors.contact && props.touched.contact && <div className="text-sm text-reddanger absolute top-12">{props.errors.contact}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="streetName" className="font-bold">Address Details</label>
                            <div className='relative'>
                                <InputField value={props.values.streetName} id={"streetName"} type={"string"} name="streetName" onChange={props.handleChange} />
                                {props.errors.streetName && props.touched.streetName && <div className="text-sm text-reddanger absolute top-12">{props.errors.streetName}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="province" className="font-bold">Province</label>
                            <div className='relative'>
                                <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='province' onChange={(e) => { setSelectedProvince(e.target.value); props.setFieldValue('province', e.target.value) }}>
                                    <option key="empty" value=''>--choose a province--</option>
                                    {provinceData && provinceData.map((province) => (<option key={province.label} value={province.value}>{province.label}</option>))}
                                </Field>
                                {props.errors.province && props.touched.province && <div className="text-sm text-reddanger absolute top-12">{props.errors.province}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="city" className="font-bold">City</label>
                            <div className='relative'>
                                <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='city' onChange={(e) => { setSelectedCity(e.target.value); props.setFieldValue('city', e.target.value) }} >
                                    <option key="empty" value=''>--choose a city--</option>
                                    {cityData.map((city) => (<option key={city.label} value={city.value}>{city.label}</option>))}
                                </Field>
                                {props.errors.city && props.touched.city && <div className="text-sm text-reddanger absolute top-12">{props.errors.city}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="addressLabel" className="font-bold">Label As:</label>
                            <div className='relative'>
                                <label><Field type="radio" name="addressLabel" value={"Home"} checked={props.values.addressLabel === "Home"} onChange={() => props.setFieldValue("addressLabel", "Home")} className=" checked:bg-maingreen mx-2 focus:ring-0" id="Home" />Home</label>
                                <label><Field type="radio" name="addressLabel" value={"Work"} checked={props.values.addressLabel === "Work"} onChange={() => props.setFieldValue("addressLabel", "Work")} className=" checked:bg-maingreen mx-2 focus:ring-0" id="Work" /> Work</label>
                                {props.errors.addressLabel && props.touched.addressLabel && <div className="text-sm text-reddanger absolute top-12">{props.errors.addressLabel}</div>}
                            </div>
                        </div>
                        <div className="mt-8"><Modal isDisabled={!props.dirty || !props.isValid} modalTitle={"Modify Address"} toggleName={"Modify Address"} content={"By modifying the address, you're altering information for future use. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} /></div>
                    </Form >
                )}
            </Formik >
        </div >
    )
}