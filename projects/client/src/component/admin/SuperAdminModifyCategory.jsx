import React, { useState, useEffect } from 'react';
import * as yup from "yup";
import axios from 'axios';
import { Formik, Form } from 'formik';
import { useNavigate, useParams } from "react-router-dom";

import Modal from '../Modal';
import InputField from '../InputField';
import AlertPopUp from '../AlertPopUp';
import Button from '../Button';
import FarmersMarket from '../../assets/FarmersMarket.png';

export default function SuperAdminModifyCategory() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [categoryDetails, setCategoryDetails] = useState({
        name: "",
        file: ""
    })
    const [imagePreview, setImagePreview] = useState(null);
    const token = localStorage.getItem("token")

    const categorySchema = yup.object().shape({
        name: yup.string().max(50, 'Category name must not exceed 50 characters').typeError("Name must be a valid text"),
    })
    const { id } = useParams()
    const navigate = useNavigate()

    const getOneCategory = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    setCategoryDetails({
                        name: data.name,
                        file: `${process.env.REACT_APP_BASE_URL}${data.imgCategory}`,
                    })
                } else {
                    setCategoryDetails({ name: "", file: "" });
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }

    const handleSubmit = async (values, { setSubmitting, resetForm, setStatus, initialValues, setFieldValue }) => {
        setSubmitting(true)
        const { name, file } = values;
        console.log("berhasil click submit")
        const formData = new FormData();
        if (name !== categoryDetails.name) { formData.append('name', name); }
        if (file) { formData.append('file', file); }
        try {
            const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/admins/categories/${id}/modify`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                },
            })

            if (response.status === 200) {
                resetForm({ values: initialValues })
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
                handleShowAlert()
                setFieldValue("file", null)
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
            if (response?.status === 404) {
                setErrorMessage("Category not found")
            }
            if (response?.status === 500) {
                setErrorMessage("Create category failed: Server error")
            }
            handleShowAlert()
            resetForm()
        } finally {
            setSubmitting(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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

    const handleImageError = (event) => {
        event.target.src =
            'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        getOneCategory()
    }, [successMessage])

    function preview(event) {
        const file = event.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    }

    return (
        <div className='py-4 px-2 flex flex-col font-inter w-full sm:max-w-7xl mx-auto h-screen'>
            <div className='flex sticky top-0 z-10 sm:static bg-white py-3 lg:pt-10'>
                <div className="grid justify-center content-center"><Button condition={"back"} onClick={() => navigate(-1)} /></div>
                <div className='text-xl sm:text-3xl sm:font-bold sm:text-maingreen px-6 sm:mx-auto'>Modify My Category</div>
            </div>
            {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert} />) : (null)}
            <div className='grid grid-cols-1 lg:grid-cols-2 h-full justify-center content-center gap-4'>
                <div className='hidden lg:grid content-center justify-center p-4'>
                    <img src={FarmersMarket} alt="illustration" className='w-full h-full object-cover' />
                </div>
                <div className='lg:p-4 grid content-center'>
                    <Formik enableReinitialize initialValues={{ name: categoryDetails.name, file: null, }} validationSchema={categorySchema} onSubmit={handleSubmit}>
                        {(props) => (
                            <Form>
                                <div className="flex flex-col gap-2 py-4 font-inter">
                                    <label htmlFor="name" className="">Category Name</label>
                                    <div className='relative'>
                                        <InputField value={props.values.name} name="name" id={"name"} type={"string"} onChange={props.handleChange} />
                                        {props.errors.name && props.touched.name && <div className="text-reddanger absolute top-12">{props.errors.name}</div>}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 py-4 mb-24">
                                    <label htmlFor="img" className="">Category Image</label>
                                    <div>
                                        {(imagePreview) ? (
                                            <img
                                                id="frame"
                                                className="w-36 h-36 justify-center mx-auto m-2 object-cover"
                                                src={imagePreview}
                                                onError={handleImageError}
                                                alt="/"
                                            />
                                        ) : (
                                            <img
                                                className="w-36 h-36 justify-center mx-auto m-2 object-cover"
                                                src={categoryDetails?.file}
                                                onError={handleImageError}
                                                alt="/"
                                            />
                                        )}
                                    </div>
                                    <div className='relative'>
                                        <input className='border border-gray-300 text-xs w-full focus:border-darkgreen focus:ring-0' type="file" id="file" name="file" onChange={(e) => { props.setFieldValue("file", e.currentTarget.files[0]); preview(e) }} />
                                        {props.errors.file && props.touched.file && <div className="text-reddanger absolute top-12">{props.errors.file}</div>}
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <Modal isDisabled={!props.dirty} modalTitle={"Modify Category"} toggleName={"Modify Category"} content={"Editing this product will permanently change it. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} />
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div >
    )
}
