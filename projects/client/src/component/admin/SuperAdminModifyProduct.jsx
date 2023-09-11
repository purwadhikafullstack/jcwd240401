import React, { useState, useEffect } from 'react';
import * as yup from "yup";
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import { useNavigate, useParams } from "react-router-dom";

import Modal from '../Modal';
import InputField from '../InputField';
import AlertPopUp from '../AlertPopUp';
import Button from '../Button';

export default function SuperAdminModifyProduct() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [allCategory, setAllCategory] = useState([])
    const [productDetails, setProductDetails] = useState({
        name: "",
        file: "",
        category_id: "",
        description: "",
        weight: "",
        unitOfMeasurement: "",
        basePrice: "",
        storageInstruction: "",
        storagePeriod: "",
    })
    const [imagePreview, setImagePreview] = useState(null);
    const uOMOptions = [{ label: "GR", value: "gr" }, { label: "ML", value: "ml" }]
    const token = localStorage.getItem("token")
    const { id } = useParams()
    const navigate = useNavigate()

    const modifyProductSchema = yup.object().shape({
        name: yup.string().trim().max(50, "Maximum character is 50").typeError("Name must be a valid text"),
        category_id: yup.string().trim(),
        description: yup.string().trim().max(500, "Maximum character is 500").typeError("Description must be a valid text"),
        weight: yup.number().test("is-positive-integer", "Weight must be a positive integer", (value) => { return !isNaN(value) && parseInt(value) > 0; }),
        unitOfMeasurement: yup.string().trim().oneOf(["gr", "ml"], "Unit of measurement must be 'gr' or 'ml'"),
        basePrice: yup.number().test("is-valid-number", "Price must be a valid number", (value) => { return !isNaN(value); })
            .test("is-price-valid-range", "Price must be between 0 and 100,000,000", (value) => {
                const numericValue = parseInt(value);
                return numericValue >= 0 && numericValue <= 100000000;
            }),
        storageInstruction: yup.string().trim().max(255, "Maximum character is 255").typeError("Storage instruction must be a valid text"),
        storagePeriod: yup.string().trim().max(255, "Maximum character is 255").typeError("Storage period must be a valid text"),
    });

    const getOneProduct = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    setProductDetails({
                        name: data.name,
                        file: `${process.env.REACT_APP_BASE_URL}${data.imgProduct}`,
                        category_id: data.category_id,
                        description: data.description,
                        weight: data.weight,
                        unitOfMeasurement: data.unitOfMeasurement,
                        basePrice: data.basePrice,
                        storageInstruction: data.storageInstruction,
                        storagePeriod: data.storagePeriod,
                    })
                } else {
                    setProductDetails([]);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }

    const getCategory = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/no-pagination-categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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

    const handleSubmit = async (values, { setSubmitting, resetForm, setStatus, initialValues, setFieldValue }) => {
        const { file, name, category_id, description, weight, unitOfMeasurement, basePrice, storageInstruction, storagePeriod } = values;
        console.log("berhasil click submit")
        const formData = new FormData();
        if (file) { formData.append('file', file); }
        if (name !== productDetails.name || weight !== productDetails.weight || unitOfMeasurement !== productDetails.unitOfMeasurement) {
            formData.append('name', name);
            formData.append('weight', weight);
            formData.append('unitOfMeasurement', unitOfMeasurement);
        }
        if (category_id !== productDetails.category_id) { formData.append('category_id', category_id); }
        if (description !== productDetails.description) { formData.append('description', description); }
        if (basePrice !== productDetails.basePrice) { formData.append('basePrice', basePrice); }
        if (storageInstruction !== productDetails.storageInstruction) { formData.append('storageInstruction', storageInstruction); }
        if (storagePeriod !== productDetails.storagePeriod) { formData.append('storagePeriod', storagePeriod); }
        try {
            const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/admins/products/${id}/modify`, formData, {
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
            if (response?.data?.message == "Similar product already exist") {
                setStatus({ success: false, msg: "Similar product already exist" });
                setErrorMessage(`Similar product already exist`)
            }
            if (response?.data?.error) {
                const errMsg = response.data.error;
                console.log(errMsg)
                setStatus({ success: false, errors: errMsg });
                setErrorMessage(`${errMsg}`);
            }
            if (response?.status === 404) {
                setErrorMessage("Product not found")
            }
            if (response?.status === 500) {
                setErrorMessage("Create product failed: Server error")
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

    const handleImageError = (event) => {
        event.target.src =
            'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
    };

    useEffect(() => {
        getCategory()
        getOneProduct()
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [successMessage])

    function preview(event) {
        const file = event.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    }
    return (
        <div className='py-4 px-2 flex flex-col font-inter w-full sm:max-w-7xl mx-auto h-full'>
            <div className='flex lg:pt-10'>
                <div className="grid justify-center content-center"><Button condition={"back"} onClick={() => navigate(-1)} /></div>
                <div className='text-xl sm:text-3xl sm:font-bold sm:text-maingreen px-6 sm:mx-auto'>Modify My Product</div>
            </div>
            {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert} />) : (null)}
            <div className='grid'>
                <div className='lg:p-4 grid content-center'>
                    <Formik enableReinitialize initialValues={{ name: productDetails.name, description: productDetails.description, category_id: productDetails.category_id, weight: productDetails.weight, unitOfMeasurement: productDetails.unitOfMeasurement, basePrice: productDetails.basePrice, storageInstruction: productDetails.storageInstruction, storagePeriod: productDetails.storagePeriod, file: null, }} validationSchema={modifyProductSchema} onSubmit={handleSubmit}>
                        {(props) => (
                            <Form className='flex flex-col lg:grid lg:grid-cols-2 gap-4'>
                                <div className='lg:p-4'>
                                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                        <label htmlFor="name" className="">Product Name</label>
                                        <div className='relative'>
                                            <InputField value={props.values.name} id={"name"} type={"string"} name="name" onChange={props.handleChange} />
                                            {props.errors.name && props.touched.name && <div className="text-reddanger absolute top-12">{props.errors.name}</div>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                        <label htmlFor="description" className="">Description</label>
                                        <div className='relative'>
                                            <InputField value={props.values.description} id={"description"} type={"string"} name="description" onChange={props.handleChange} />
                                            {props.errors.description && props.touched.description && <div className="text-reddanger absolute top-12">{props.errors.description}</div>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                        <label htmlFor="category_id" className="">Select Category</label>
                                        <div className='relative'>
                                            <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='category_id'>
                                                <option key="empty" value=''>--choose a category--</option>
                                                {allCategory.map((category) => (
                                                    <option key={category.value} value={category.value}>
                                                        {category.label}
                                                    </option>
                                                ))}
                                            </Field>
                                            {props.errors.category_id && props.touched.category_id && <div className="text-reddanger absolute top-12">{props.errors.category_id}</div>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                        <label htmlFor="weight" className="">Weight</label>
                                        <div className='relative'>
                                            <InputField value={props.values.weight} id={"weight"} type={"number"} name="weight" onChange={props.handleChange} />
                                            {props.errors.weight && props.touched.weight && <div className="text-reddanger absolute top-12">{props.errors.weight}</div>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                        <label htmlFor="unitOfMeasurement" className="">Unit Of Measurement</label>
                                        <div className='relative'>
                                            <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='unitOfMeasurement'>
                                                <option key="empty" value=''>--choose one below--</option>
                                                {uOMOptions.map((uOM) => (
                                                    <option key={uOM.value} value={uOM.value}>
                                                        {uOM.label}
                                                    </option>
                                                ))}
                                            </Field>
                                            {props.errors.unitOfMeasurement && props.touched.unitOfMeasurement && <div className="text-reddanger absolute top-12">{props.errors.unitOfMeasurement}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className='lg:p-4'>
                                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                        <label htmlFor="basePrice" className="">Base Price</label>
                                        <div className='relative'>
                                            <InputField value={props.values.basePrice} id={"basePrice"} type={"number"} name="basePrice" onChange={props.handleChange} />
                                            {props.errors.basePrice && props.touched.basePrice && <div className="text-reddanger absolute top-12">{props.errors.basePrice}</div>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                        <label htmlFor="storageInstruction" className="">Storage Instruction</label>
                                        <div className='relative'>
                                            <InputField value={props.values.storageInstruction} id={"storageInstruction"} type={"string"} name="storageInstruction" onChange={props.handleChange} />
                                            {props.errors.storageInstruction && props.touched.storageInstruction && <div className="text-reddanger absolute top-12">{props.errors.storageInstruction}</div>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                        <label htmlFor="storagePeriod" className="">Storage Period</label>
                                        <div className='relative'>
                                            <InputField value={props.values.storagePeriod} id={"storagePeriod"} type={"string"} name="storagePeriod" onChange={props.handleChange} />
                                            {props.errors.storagePeriod && props.touched.storagePeriod && <div className="text-reddanger absolute top-12">{props.errors.storagePeriod}</div>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 py-4 mb-14 lg:mb-24">
                                        <label htmlFor="file" className="">Product Image</label>
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
                                                    src={productDetails.file}
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
                                </div>
                                <div className="my-8 lg:col-span-2 lg:px-20">
                                    <Modal isDisabled={!props.dirty} modalTitle={"Modify Product"} toggleName={"Modify"} content={"Editing this product will permanently change it. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} />
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div >
    )
}
