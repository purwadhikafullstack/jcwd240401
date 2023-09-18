import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';

import Modal from '../../../Modal';
import InputField from '../../../InputField';
import handleImageError from '../../../../helpers/handleImageError';
import { createProductSchema } from '../../../../helpers/validationSchema';
import AlertHelper from '../../../../helpers/AlertHelper';

export default function CreateProduct() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [allCategory, setAllCategory] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const uOMOptions = [{ label: "GR", value: "gr" }, { label: "ML", value: "ml" }]
    const token = localStorage.getItem("token")

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

    const resetFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (values, { setSubmitting, resetForm, setStatus }) => {
        const { file, name, category_id, description, weight, unitOfMeasurement, basePrice, storageInstruction, storagePeriod } = values;
        console.log("berhasil click submit")
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);
        formData.append('category_id', category_id);
        formData.append('description', description);
        formData.append('weight', weight);
        formData.append('unitOfMeasurement', unitOfMeasurement);
        formData.append('basePrice', basePrice);
        formData.append('storageInstruction', storageInstruction);
        formData.append('storagePeriod', storagePeriod);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/admins/product`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                },
            })

            if (response.status === 201) {
                resetForm()
                resetFileInput();
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
            if (response.data.message == "Similar product already exist") {
                setStatus({ success: false, msg: "Similar product already exist" });
                setErrorMessage(`Similar product already exist`)
            }
            if (response.data.error) {
                const errMsg = response.data.error;
                console.log(errMsg)
                setStatus({ success: false, errors: errMsg });
                setErrorMessage(`${errMsg}`);
            }
            if (response.status === 500) {
                setErrorMessage("Create product failed: Server error")
            }
            resetForm()
        } finally {
            getCategory();
            resetFileInput();
            setImagePreview(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setSubmitting(false);
        }
    };

    useEffect(() => {
        getCategory()
    }, [])

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
        <div className='w-full sm:w-8/12 mx-auto flex flex-col justify-center font-inter'>
            <AlertHelper successMessage={successMessage} errorMessage={errorMessage} />
            <Formik initialValues={{ name: "", description: "", category_id: "", weight: "", unitOfMeasurement: "", basePrice: "", storageInstruction: "", storagePeriod: "", file: null, }} validationSchema={createProductSchema} onSubmit={handleSubmit}>
                {(props) => (
                    <Form>
                        <div className="text-xs text-reddanger">* required</div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="name" className="font-medium">Name <span className="text-sm font-normal">(max. 50 characters) </span><span className="text-reddanger">*</span></label>
                            <div className='relative'>
                                <InputField value={props.values.name} id={"name"} type={"string"} name="name" onChange={props.handleChange} />
                                {props.errors.name && props.touched.name && <div className="text-sm text-reddanger absolute top-12">{props.errors.name}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="description" className="font-medium">Description <span className="text-sm font-normal">(max. 500 characters) </span><span className="text-reddanger">*</span></label>
                            <div className='relative'>
                                <InputField value={props.values.description} id={"description"} type={"string"} name="description" onChange={props.handleChange} />
                                {props.errors.description && props.touched.description && <div className="text-sm text-reddanger absolute top-12">{props.errors.description}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="category_id" className="font-medium">Category <span className="text-reddanger">*</span></label>
                            <div className='relative'>
                                <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='category_id'>
                                    <option key="empty" value=''>--choose a category--</option>
                                    {allCategory.map((category) => (<option key={category.value} value={category.value}>{category.label}</option>))}
                                </Field>
                                {props.errors.category_id && props.touched.category_id && <div className="text-sm text-reddanger absolute top-12">{props.errors.category_id}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="weight" className="font-medium">Weight <span className="text-sm font-normal">(in gr/ml) </span><span className="text-reddanger">*</span></label>
                            <div className='relative'>
                                <InputField value={props.values.weight} id={"weight"} type={"number"} name="weight" onChange={props.handleChange} />
                                {props.errors.weight && props.touched.weight && <div className="text-sm text-reddanger absolute top-12">{props.errors.weight}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="unitOfMeasurement" className="font-medium">Unit Of Measurement <span className="text-reddanger">*</span></label>
                            <div className='relative'>
                                <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='unitOfMeasurement'>
                                    <option key="empty" value=''>--choose one UoM--</option>
                                    {uOMOptions.map((uOM) => (<option key={uOM.value} value={uOM.value}>{uOM.label}</option>))}
                                </Field>
                                {props.errors.unitOfMeasurement && props.touched.unitOfMeasurement && <div className="text-sm text-reddanger absolute top-12">{props.errors.unitOfMeasurement}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="basePrice" className="font-medium">Base Price <span className="text-sm font-normal">(in rupiah) </span><span className="text-reddanger">*</span></label>
                            <div className='relative'>
                                <InputField value={props.values.basePrice} id={"basePrice"} type={"number"} name="basePrice" onChange={props.handleChange} />
                                {props.errors.basePrice && props.touched.basePrice && <div className="text-sm text-reddanger absolute top-12">{props.errors.basePrice}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="storageInstruction" className="font-medium">Storage Instruction <span className="text-sm font-normal">(max. 255 characters) </span><span className="text-reddanger">*</span></label>
                            <div className='relative'>
                                <InputField value={props.values.storageInstruction} id={"storageInstruction"} type={"string"} name="storageInstruction" onChange={props.handleChange} />
                                {props.errors.storageInstruction && props.touched.storageInstruction && <div className="text-sm text-reddanger absolute top-12">{props.errors.storageInstruction}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="storagePeriod" className="font-medium">Storage Period <span className="text-sm font-normal">(max. 255 characters) </span><span className="text-reddanger">*</span></label>
                            <div className='relative'>
                                <InputField value={props.values.storagePeriod} id={"storagePeriod"} type={"string"} name="storagePeriod" onChange={props.handleChange} />
                                {props.errors.storagePeriod && props.touched.storagePeriod && <div className="text-sm text-reddanger absolute top-12">{props.errors.storagePeriod}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 mb-24">
                            <label htmlFor="file" className="font-medium">Image <span className="text-sm font-normal">(.jpg, .jpeg, .png) max. 1MB </span><span className="text-reddanger">*</span></label>
                            <div>
                                {(imagePreview) ? (
                                    <img id="frame" className="w-36 h-36 justify-center mx-auto m-2 object-cover border-2 border-maingreen p-1" src={imagePreview} onError={handleImageError} alt="/" />
                                ) : (
                                    <img className="w-36 h-36 justify-center mx-auto m-2 object-cover border-2 border-maingreen p-1" src={""} onError={handleImageError} alt="/" />
                                )}
                            </div>
                            <div className='relative'>
                                <input className='border border-gray-300 text-sm w-full focus:border-darkgreen focus:ring-0' type="file" id="file" name="file" onChange={(e) => { props.setFieldValue("file", e.currentTarget.files[0]); preview(e) }} required ref={fileInputRef} />
                                {props.errors.file && props.touched.file && <div className="text-sm text-reddanger absolute top-12">{props.errors.file}</div>}
                            </div>
                        </div>
                        <div className="mt-8">
                            <Modal isDisabled={!props.dirty || !props.isValid} modalTitle={"Create New Product"} toggleName={"Create Product"} content={"By creating this product, you're adding content for future accessibility. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} />
                        </div>
                    </Form>
                )}
            </Formik>
        </div >
    )
}
