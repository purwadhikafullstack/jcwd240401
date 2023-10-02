import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { useNavigate, useParams } from "react-router-dom";

import Modal from '../Modal';
import InputField from '../InputField';
import Button from '../Button';
import FarmersMarket from '../../assets/FarmersMarket.png';
import handleImageError from '../../helpers/handleImageError'
import { modifyCategorySchema } from '../../helpers/validationSchema';
import AlertHelper from '../AlertHelper';
import { getCategoryById, modifyCategory } from '../../api/category';

export default function SuperAdminModifyCategory() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [categoryDetails, setCategoryDetails] = useState({ name: "", file: "" })
    const [imagePreview, setImagePreview] = useState(null);
    const token = localStorage.getItem("token")
    const { id } = useParams()
    const navigate = useNavigate()

    const getOneCategory = async () => {
        try {
            const response = await getCategoryById(token, id)
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
        const formData = new FormData();
        if (name !== categoryDetails.name) { formData.append('name', name); }
        if (file) { formData.append('file', file); }
        try {
            const response = await modifyCategory(token, id, formData);
            if (response.status === 200) {
                resetForm({ values: initialValues })
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
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
                setStatus({ success: false, errors: errMsg });
                setErrorMessage(`${errMsg}`);
            }
            if (response?.status === 413) {
                setStatus({ success: false, errors: "File size exceeded the limit" });
                setErrorMessage(`File size exceeded the limit`);
            }
            if (response?.status === 404) {
                setErrorMessage("Category not found")
            }
            if (response?.status === 500) {
                setErrorMessage("Modify category failed: Server error")
            }
            resetForm()
        } finally {
            setSubmitting(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        getOneCategory()
    }, [successMessage])

    function preview(event) {
        const file = event.target.files[0];
        if (file === undefined) {
            setImagePreview(null)
        } else {
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
            <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
            <div className='grid grid-cols-1 lg:grid-cols-2 h-full justify-center content-center gap-4'>
                <div className='hidden lg:grid content-center justify-center p-4'>
                    <img src={FarmersMarket} alt="illustration" className='w-full h-full object-cover' />
                </div>
                <div className='lg:p-4 grid content-center'>
                    <Formik enableReinitialize initialValues={{ name: categoryDetails.name, file: null, }} validationSchema={modifyCategorySchema} onSubmit={handleSubmit}>
                        {(props) => (
                            <Form>
                                <div className="flex flex-col gap-2 py-4 font-inter">
                                    <label htmlFor="name" className="font-medium">Name <span className="text-sm font-normal">(max. 50 characters) </span></label>
                                    <div className='relative'>
                                        <InputField value={props.values.name} name="name" id={"name"} type={"string"} onChange={props.handleChange} />
                                        {props.errors.name && props.touched.name && <div className="text-reddanger absolute top-12">{props.errors.name}</div>}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 py-4 mb-24">
                                    <label htmlFor="img" className="font-medium">Image <span className="text-sm font-normal">(.jpg, .jpeg, .png) max. 1MB </span></label>
                                    <div>
                                        {(imagePreview) ? (
                                            <img
                                                id="frame"
                                                className="w-36 h-36 justify-center mx-auto m-2 object-cover border-2 border-maingreen p-1"
                                                src={imagePreview}
                                                onError={handleImageError}
                                                alt="/"
                                            />
                                        ) : (
                                            <img
                                                className="w-36 h-36 justify-center mx-auto m-2 object-cover border-2 border-maingreen p-1"
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
                                    <Modal buttonTypeToggle={"button"} isDisabled={!props.dirty || !props.isValid} modalTitle={"Modify Category"} toggleName={"Modify Category"} content={"Editing this category will permanently change it. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} />
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div >
    )
}
