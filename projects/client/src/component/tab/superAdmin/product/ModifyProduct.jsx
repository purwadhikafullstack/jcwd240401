import React, { useState, useEffect } from 'react'
import * as yup from "yup";
import Modal from '../../../Modal';
import AlertPopUp from '../../../AlertPopUp';
import CustomDropdown from '../../../CustomDropdown';
import axios from "axios"
import { Formik, Form, Field } from "formik"
import InputField from '../../../InputField';

export default function ModifyProduct() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [allProduct, setAllProduct] = useState([])
    const [selectedProductId, setSelectedProductId] = useState("")
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
    const modifyProductSchema = yup.object().shape({
        name: yup.string().trim().max(50, "Maximum character is 50"),
        category_id: yup.string().trim(),
        description: yup.string().trim().max(500, "Maximum character is 500"),
        weight: yup.string().trim()
            .test("is-positive-integer", "Weight must be a positive integer", (value) => {
                return !isNaN(value) && parseInt(value) > 0;
            }),
        unitOfMeasurement: yup.string().trim().oneOf(["gr", "ml"], "Unit of measurement must be 'gr' or 'ml'"),
        basePrice: yup.string().trim()
            .test("is-valid-number", "Price must be a valid number", (value) => {
                return !isNaN(value);
            })
            .test("is-price-valid-range", "Price must be between 0 and 100,000,000", (value) => {
                const numericValue = parseInt(value);
                return numericValue >= 0 && numericValue <= 100000000;
            }),
        storageInstruction: yup.string().trim().max(255, "Maximum character is 255"),
        storagePeriod: yup.string().trim().max(255, "Maximum character is 255"),
    });

    const getOneProduct = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/admins/products/${selectedProductId}`);
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    setProductDetails({
                        name: data.name,
                        file: `http://localhost:8000${data.imgProduct}`,
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

    const getProduct = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/admins/no-pagination-products`);
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    let options = data.map((d) => ({
                        label: d.name,
                        value: d.id,
                    }));
                    setAllProduct(options);
                } else {
                    setAllProduct([]);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }

    const getCategory = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/admins/no-pagination-categories`);
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
        const { file, name, category_id, description, weight, unitOfMeasurement, basePrice, storageInstruction, storagePeriod } = values;
        console.log("berhasil click submit")
        const formData = new FormData();
        if (file) { formData.append('file', file); }
        if (name !== productDetails.name) { formData.append('name', name); }
        if (category_id !== productDetails.category_id) { formData.append('category_id', category_id); }
        if (description !== productDetails.description) { formData.append('description', description); }
        if (weight !== productDetails.weight) { formData.append('weight', weight); }
        if (unitOfMeasurement !== productDetails.unitOfMeasurement) { formData.append('unitOfMeasurement', unitOfMeasurement); }
        if (basePrice !== productDetails.basePrice) { formData.append('basePrice', basePrice); }
        if (storageInstruction !== productDetails.storageInstruction) { formData.append('storageInstruction', storageInstruction); }
        if (storagePeriod !== productDetails.storagePeriod) { formData.append('storagePeriod', storagePeriod); }
        try {
            const response = await axios.patch(`http://localhost:8000/api/admins/products/${selectedProductId}/modify`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })

            if (response.status === 200) {
                resetForm({ values: initialValues })
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
                handleShowAlert()
                setSelectedProductId("")
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
            if (response?.status === 500) {
                setErrorMessage("Create product failed: Server error")
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
        getCategory()
        getProduct()
        if (selectedProductId) {
            getOneProduct()
        }
    }, [successMessage, selectedProductId])

    const handleChangeDropdown = (obj) => {
        setSelectedProductId(obj.value)
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
                    Selected Product
                </div>
                <CustomDropdown options={allProduct} onChange={handleChangeDropdown} placeholder={"--select a product to modify--"} />
            </div>
            <div className='flex flex-col gap-2 py-6'>
                <div className=''>
                    Modify Below:
                </div>
                {(selectedProductId) ? (
                    <Formik enableReinitialize initialValues={{ name: productDetails.name, description: productDetails.description, category_id: productDetails.category_id, weight: productDetails.weight, unitOfMeasurement: productDetails.unitOfMeasurement, basePrice: productDetails.basePrice, storageInstruction: productDetails.storageInstruction, storagePeriod: productDetails.storagePeriod, file: null, }} validationSchema={modifyProductSchema} onSubmit={handleSubmit}>
                        {(props) => (
                            <Form>
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
                                        <InputField value={props.values.weight} id={"weight"} type={"string"} name="weight" onChange={props.handleChange} />
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
                                <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                    <label htmlFor="basePrice" className="">Base Price</label>
                                    <div className='relative'>
                                        <InputField value={props.values.basePrice} id={"basePrice"} type={"string"} name="basePrice" onChange={props.handleChange} />
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
                                <div className="flex flex-col gap-2 py-4 mb-24">
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
                                        <input className='border border-gray-300 text-xs w-full focus:border-darkgreen focus:ring-0' type="file" id="file" name="file" onChange={(e) => { props.setFieldValue("file", e.currentTarget.files[0]); }} />
                                        {props.errors.file && props.touched.file && <div className="text-reddanger absolute top-12">{props.errors.file}</div>}
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <Modal isDisabled={!props.dirty} modalTitle={"Modify Product"} toggleName={"Modify"} content={"Editing this product will permanently change it. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} />
                                </div>
                            </Form>
                        )}
                    </Formik>
                ) : (
                    <div className='text-center text-darkgrey'>No Product Selected</div>
                )}
            </div>
        </div>
    )
}
