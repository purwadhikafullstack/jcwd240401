import React, { useState, useEffect } from 'react';
import * as yup from "yup";
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs'

import Modal from '../Modal';
import InputField from '../InputField';
import AlertPopUp from '../AlertPopUp';
import Button from '../Button';

export default function UserProfileEditContent() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [profileDetails, setProfileDetails] = useState({
        name: "",
        email: "",
        phone: "",
        birthdate: "",
        gender: "",
    })

    const navigate = useNavigate()

    const token = localStorage.getItem("token")
    const genderOption = [{ label: "Male", value: "male" }, { label: "Female", value: "female" }]

    const getProfile = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    setProfileDetails({
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        birthdate: data.birthdate,
                        gender: data.gender,
                    })
                } else {
                    setProfileDetails({});
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }

    const validRgx = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

    const modifyProfileSchema = yup.object().shape({
        name: yup.string().max(50, 'Maximum character is 50').trim().nullable(),
        email: yup.string().email('Please enter with email format').nullable(),
        phone: yup.string().matches(validRgx, 'Phone number is not valid').nullable(),
        gender: yup.string().oneOf(['male', 'female'], 'Gender must be "male" or "female"').nullable(),
        birthdate: yup.date().max(new Date(), 'Birthdate cannot be in the future').nullable(),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm, setStatus, initialValues }) => {
        const { name, email, phone, birthdate, gender } = values;
        console.log("berhasil click submit")
        const data = {}
        if (name !== profileDetails.name) { data.name = name }
        if (email !== profileDetails.email) { data.email = email }
        if (phone !== profileDetails.phone) { data.phone = phone }
        if (birthdate !== profileDetails.birthdate) { data.birthdate = birthdate }
        if (gender !== profileDetails.gender) { data.gender = gender }
        try {
            const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/users/profile/credential`, data, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (response.status === 200) {
                resetForm({ values: initialValues })
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
                handleShowAlert()
            }
        } catch (error) {
            const response = error.response;
            if (response?.data?.message === "An error occurs") {
                const { msg } = response.data?.errors[0];
                if (msg) {
                    setStatus({ success: false, msg });
                    setErrorMessage(`${msg}`)
                }
            }
            if (response?.data?.error) {
                const errMsg = response.data.error;
                console.log(errMsg)
                setStatus({ success: false, errors: errMsg });
                setErrorMessage(`${errMsg}`);
            }
            if (response?.status === 500) {
                setErrorMessage("Modify Product failed: Server error")
            }
            handleShowAlert()
            resetForm()
        } finally {
            setSubmitting(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        window.scrollTo({ top: 0, behavior: 'smooth' })
        getProfile()
    }, [successMessage])

    return (
        <div className='py-4 px-2 flex flex-col w-full sm:max-w-3xl mx-auto gap-4 justify-center font-inter'>
            <div>
                <div className='flex sticky top-0 z-50 sm:static bg-white py-3 lg:pt-10'>
                    <div className="grid justify-center content-center"><Button condition={"back"} onClick={() => navigate(-1)} /></div>
                    <div className='text-xl sm:text-3xl sm:font-bold sm:text-maingreen sm:mx-auto px-6'>Edit My Profile</div>
                </div>
                {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert} />) : (null)}
                <div className='flex flex-col gap-2 py-6 mx-2 sm:mx-0'>
                    <Formik enableReinitialize initialValues={{ name: profileDetails.name, email: profileDetails.email, phone: profileDetails.phone, birthdate: profileDetails.birthdate ?? "", gender: profileDetails.gender ?? "" }} validationSchema={modifyProfileSchema} onSubmit={handleSubmit}>
                        {(props) => (
                            <Form>
                                <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                    <label htmlFor="name" className="font-bold">Name</label>
                                    <div className='relative'>
                                        <InputField value={props.values.name} id={"name"} type={"string"} name="name" onChange={props.handleChange} />
                                        {props.errors.name && props.touched.name && <div className="text-reddanger absolute top-12">{props.errors.name}</div>}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                    <label htmlFor="email" className="font-bold">Email</label>
                                    <div className='relative'>
                                        <InputField value={props.values.email} id={"email"} type={"string"} name="email" onChange={props.handleChange} />
                                        {props.errors.email && props.touched.email && <div className="text-reddanger absolute top-12">{props.errors.email}</div>}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                    <label htmlFor="phone" className="font-bold">Phone</label>
                                    <div className='relative'>
                                        <InputField value={props.values.phone} id={"phone"} type={"string"} name="phone" onChange={props.handleChange} />
                                        {props.errors.phone && props.touched.phone && <div className="text-reddanger absolute top-12">{props.errors.phone}</div>}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                    <label htmlFor="birthdate" className="font-bold">Birth Date</label>
                                    <div className='relative'>
                                        <InputField value={dayjs(props.values?.birthdate).format('YYYY-MM-DD')} id={"birthdate"} type={"date"} name="birthdate" onChange={props.handleChange} />
                                        {props.errors.birthdate && props.touched.birthdate && <div className="text-reddanger absolute top-12">{props.errors.birthdate}</div>}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                    <label htmlFor="gender" className="font-bold">Gender</label>
                                    <div className='relative'>
                                        <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='gender'>
                                            <option key="empty" value=''>--choose one below--</option>
                                            {genderOption.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Field>
                                        {props.errors.gender && props.touched.gender && <div className="text-reddanger absolute top-12">{props.errors.gender}</div>}
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <Modal isDisabled={!props.dirty && props.isValid} buttonTypeToggle={"button"} modalTitle={"Modify Product"} toggleName={"Modify"} content={"Editing this product will permanently change it. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} />
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    )
}
