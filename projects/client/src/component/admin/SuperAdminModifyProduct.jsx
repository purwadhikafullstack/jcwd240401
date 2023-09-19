import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import { useNavigate, useParams } from "react-router-dom";

import Modal from '../Modal';
import InputField from '../InputField';
import Button from '../Button';
import handleImageError from '../../helpers/handleImageError'
import { modifyProductSchema } from '../../helpers/validationSchema';
import AlertHelper from '../AlertHelper';

export default function SuperAdminModifyProduct() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [allCategory, setAllCategory] = useState([])
    const [productDetails, setProductDetails] = useState({ name: "", file: "", category_id: "", description: "", weight: "", unitOfMeasurement: "", basePrice: "", storageInstruction: "", storagePeriod: "", })
    const [imagePreview, setImagePreview] = useState(null);
    const uOMOptions = [{ label: "GR", value: "gr" }, { label: "ML", value: "ml" }]
    const token = localStorage.getItem("token")
    const { id } = useParams()
    const navigate = useNavigate()

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
            const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/admins/products/${id}/modify`, formData, { headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }, })
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
            resetForm()
        } finally {
            setSubmitting(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        getCategory()
        getOneProduct()
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
        <div className='py-4 px-2 flex flex-col font-inter w-full sm:max-w-7xl mx-auto h-full'>
            <div className='flex sticky top-0 z-10 sm:static bg-white py-3 lg:pt-10'>
                <div className="grid justify-center content-center"><Button condition={"back"} onClick={() => navigate(-1)} /></div>
                <div className='text-xl sm:text-3xl sm:font-bold sm:text-maingreen px-6 sm:mx-auto'>Modify My Product</div>
            </div>
            <AlertHelper successMessage={successMessage} errorMessage={errorMessage} />
            <div className='grid'>
                <div className='lg:p-4 grid content-center'>
                    <Formik enableReinitialize initialValues={{ name: productDetails.name, description: productDetails.description, category_id: productDetails.category_id, weight: productDetails.weight, unitOfMeasurement: productDetails.unitOfMeasurement, basePrice: productDetails.basePrice, storageInstruction: productDetails.storageInstruction, storagePeriod: productDetails.storagePeriod, file: null, }} validationSchema={modifyProductSchema} onSubmit={handleSubmit}>
                        {(props) => (
                            <Form className='flex flex-col lg:grid lg:grid-cols-2 gap-4'>
                                <div className='lg:p-4'>
                                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                        <label htmlFor="name" className='font-medium'>Name <span className="text-sm font-normal">(max. 50 characters) </span></label>
                                        <div className='relative'>
                                            <InputField value={props.values.name} id={"name"} type={"string"} name="name" onChange={props.handleChange} />
                                            {props.errors.name && props.touched.name && <div className="text-reddanger absolute top-12">{props.errors.name}</div>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                        <label htmlFor="description" className='font-medium'>Description <span className="text-sm font-normal">(max. 500 characters) </span></label>
                                        <div className='relative'>
                                            <InputField value={props.values.description} id={"description"} type={"string"} name="description" onChange={props.handleChange} />
                                            {props.errors.description && props.touched.description && <div className="text-reddanger absolute top-12">{props.errors.description}</div>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                        <label htmlFor="category_id" className='font-medium'>Category</label>
                                        <div className='relative'>
                                            <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='category_id'>
                                                <option key="empty" value=''>--choose a category--</option>
                                                {allCategory.map((category) => (<option key={category.value} value={category.value}>{category.label}</option>))}
                                            </Field>
                                            {props.errors.category_id && props.touched.category_id && <div className="text-reddanger absolute top-12">{props.errors.category_id}</div>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                        <label htmlFor="weight" className='font-medium'>Weight <span className="text-sm font-normal">(in gr/ml) </span></label>
                                        <div className='relative'>
                                            <InputField value={props.values.weight} id={"weight"} type={"number"} name="weight" onChange={props.handleChange} />
                                            {props.errors.weight && props.touched.weight && <div className="text-reddanger absolute top-12">{props.errors.weight}</div>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                        <label htmlFor="unitOfMeasurement" className='font-medium'>Unit Of Measurement </label>
                                        <div className='relative'>
                                            <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='unitOfMeasurement'>
                                                <option key="empty" value=''>--choose one below--</option>
                                                {uOMOptions.map((uOM) => (<option key={uOM.value} value={uOM.value}>{uOM.label}</option>))}
                                            </Field>
                                            {props.errors.unitOfMeasurement && props.touched.unitOfMeasurement && <div className="text-reddanger absolute top-12">{props.errors.unitOfMeasurement}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className='lg:p-4'>
                                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                        <label htmlFor="basePrice" className='font-medium'>Base Price <span className="text-sm font-normal">(in rupiah) </span></label>
                                        <div className='relative'>
                                            <InputField value={props.values.basePrice} id={"basePrice"} type={"number"} name="basePrice" onChange={props.handleChange} />
                                            {props.errors.basePrice && props.touched.basePrice && <div className="text-reddanger absolute top-12">{props.errors.basePrice}</div>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                        <label htmlFor="storageInstruction" className='font-medium'>Storage Instruction <span className="text-sm font-normal">(max. 255 characters) </span></label>
                                        <div className='relative'>
                                            <InputField value={props.values.storageInstruction} id={"storageInstruction"} type={"string"} name="storageInstruction" onChange={props.handleChange} />
                                            {props.errors.storageInstruction && props.touched.storageInstruction && <div className="text-reddanger absolute top-12">{props.errors.storageInstruction}</div>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                        <label htmlFor="storagePeriod" className='font-medium'>Storage Period <span className="text-sm font-normal">(max. 255 characters) </span></label>
                                        <div className='relative'>
                                            <InputField value={props.values.storagePeriod} id={"storagePeriod"} type={"string"} name="storagePeriod" onChange={props.handleChange} />
                                            {props.errors.storagePeriod && props.touched.storagePeriod && <div className="text-reddanger absolute top-12">{props.errors.storagePeriod}</div>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 py-4 mb-14 lg:mb-24">
                                        <label htmlFor="file" className='font-medium'>Image <span className="text-sm font-normal">(.jpg, .jpeg, .png) max. 1MB </span></label>
                                        <div>
                                            {(imagePreview) ? (
                                                <img id="frame" className="w-36 h-36 justify-center mx-auto m-2 object-cover border-2 border-maingreen p-1" src={imagePreview} onError={handleImageError} alt="/" />
                                            ) : (
                                                <img className="w-36 h-36 justify-center mx-auto m-2 object-cover border-2 border-maingreen p-1" src={productDetails.file} onError={handleImageError} alt="/" />
                                            )}
                                        </div>
                                        <div className='relative'>
                                            <input className='border border-gray-300 text-xs w-full focus:border-darkgreen focus:ring-0' type="file" id="file" name="file" onChange={(e) => { props.setFieldValue("file", e.currentTarget.files[0]); preview(e) }} />
                                            {props.errors.file && props.touched.file && <div className="text-reddanger absolute top-12">{props.errors.file}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="my-8 lg:col-span-2 lg:px-20">
                                    <Modal isDisabled={!props.dirty} modalTitle={"Modify Product"} toggleName={"Modify Product"} content={"Editing this product will permanently change it. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} />
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div >
    )
}
