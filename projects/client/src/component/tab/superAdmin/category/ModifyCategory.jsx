import React, { useState, useEffect } from 'react';
import * as yup from "yup";
import { Formik, Form } from "formik";
import axios from "axios";

import Modal from '../../../Modal';
import AlertPopUp from '../../../AlertPopUp';
import CustomDropdown from '../../../CustomDropdown';
import InputField from '../../../InputField';

export default function ModifyCategory() {
    const [allCategory, setAllCategory] = useState([])
    const [selectedCategoryId, setSelectedCategoryId] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [categoryDetails, setCategoryDetails] = useState({
        name: "",
        file: ""
    })
    const [imagePreview, setImagePreview] = useState(null);

    const categorySchema = yup.object().shape({
        name: yup.string().max(50, 'Category name must not exceed 50 characters'),
    })

    const getOneCategory = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/categories/${selectedCategoryId}`);
            if (response.data) {
                const data = response.data.data;
                console.log(data)
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

    const getCategory = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/no-pagination-categories`);
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    let options = data.map((d) => ({
                        label: d.name,
                        value: d.id,
                    }));
                    setAllCategory(options);
                } else {
                    setAllCategory([]);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }

    const handleSubmit = async (values, { setSubmitting, resetForm, setStatus, initialValues }) => {
        setSubmitting(true)
        const { name, file } = values;
        console.log(name)
        console.log(file)

        console.log("berhasil click submit", selectedCategoryId)
        const formData = new FormData();

        if (name !== categoryDetails.name) {
            formData.append('name', name);
        }

        if (file) {
            formData.append('file', file);
        }

        try {
            const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/admins/categories/${selectedCategoryId}/modify`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            console.log("Response:", response);
            console.log(response.data.data)

            if (response.status === 200) {
                resetForm({ values: initialValues })
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
                handleShowAlert()
                setSelectedCategoryId("")
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
            setTimeout(() => {
                window.location.reload()
            }, 4000)
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

    useEffect(() => {
        getCategory()
        if (selectedCategoryId) {
            getOneCategory()
        }
    }, [successMessage, selectedCategoryId])

    const handleChangeDropdown = (obj) => {
        setSelectedCategoryId(obj.value)
    };

    const handleImageError = (event) => {
        event.target.src =
            'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
    };

    function preview() {
        const file = event.target.files[0];
        console.log("file here:", file)
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            console.log(previewUrl)
            setImagePreview(previewUrl);
        }
    }

    return (
        <div className="w-8/12 mx-auto flex flex-col justify-center font-inter">
            {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert} />) : (null)}
            <div className="flex flex-col gap-2 py-4 font-inter border-b-2 pb-10">
                <div className="">
                    Selected Category: <span className="text-xs text-reddanger">* required</span>
                </div>
                <CustomDropdown options={allCategory} onChange={handleChangeDropdown} placeholder={"--select a category to modify--"} />
            </div>
            <div className='flex flex-col gap-2 py-6'>
                <div className=''>
                    Modify Below:
                </div>
                {(selectedCategoryId) ? (
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
                                    <label htmlFor="img" className="text-sm">Category Image</label>
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
                                        <input className='border border-gray-300 text-xs w-full focus:border-darkgreen focus:ring-0' type="file" id="file" name="file" onChange={(e) => { props.setFieldValue("file", e.currentTarget.files[0]); preview() }} />
                                        {props.errors.file && props.touched.file && <div className="text-reddanger absolute top-12">{props.errors.file}</div>}
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <Modal isDisabled={!props.dirty} modalTitle={"Modify Category"} toggleName={"Modify Category"} content={"Editing this product will permanently change it. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} />
                                </div>
                            </Form>
                        )}
                    </Formik>
                ) : (
                    <div className='text-center text-darkgrey'>No Category Selected</div>
                )}
            </div>
        </div>
    )
}
