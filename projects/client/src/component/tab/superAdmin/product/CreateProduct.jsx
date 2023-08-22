import React, { useState, useEffect } from 'react';
import * as yup from "yup";
import axios from 'axios';
import { Formik, Form, Field } from 'formik';

import Modal from '../../../Modal';
import InputField from '../../../InputField';
import AlertPopUp from '../../../AlertPopUp';

export default function CreateProduct() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [allCategory, setAllCategory] = useState([]);
    const uOMOptions = [{ label: "GR", value: "gr" }, { label: "ML", value: "ml" }]

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

    const createProductSchema = yup.object().shape({
        file: yup.mixed(),
        name: yup.string().trim().required("Product name is required").max(50, "Maximum character is 50").typeError("Name must be a valid text"),
        category_id: yup.string().trim().required("Category is required"),
        description: yup.string().trim().required("Description is required").max(500, "Maximum character is 500").typeError("Description must be a valid text"),
        weight: yup.number().required("Weight is required").min(5, "Weight must be at least 5").typeError('Weight must be a valid number'),
        unitOfMeasurement: yup.string().trim().required("Unit of measurement is required").oneOf(["gr", "ml"], "Unit of measurement must be 'gr' or 'ml'"),
        basePrice: yup.number().required("Price is required").min(1000, "Weight must be at least Rp 1.000").typeError('Base price must be a valid number'),
        storageInstruction: yup.string().trim().required("Storage instruction is required").max(255, "Maximum character is 255").typeError("Storage instruction must be a valid text"),
        storagePeriod: yup.string().trim().required("Storage period is required").max(255, "Maximum character is 255").typeError("Storage period must be a valid text"),
    });

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
                },
            })

            if (response.status === 201) {
                resetForm()
                setErrorMessage("")
                setSuccessMessage(response.data?.message)
                handleShowAlert()
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
            handleShowAlert()
            resetForm()
        } finally {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setSubmitting(false);
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
    }, [])

    return (
        <div className='w-8/12 mx-auto flex flex-col justify-center font-inter'>
            {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert} />) : (null)}
            <Formik initialValues={{ name: "", description: "", category_id: "", weight: "", unitOfMeasurement: "", basePrice: "", storageInstruction: "", storagePeriod: "", file: null, }} validationSchema={createProductSchema} onSubmit={handleSubmit}>
                {(props) => (
                    <Form>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="name" className="">Product Name <span className="text-xs text-reddanger">* required</span></label>
                            <div className='relative'>
                                <InputField value={props.values.name} id={"name"} type={"string"} name="name" onChange={props.handleChange} />
                                {props.errors.name && props.touched.name && <div className="text-sm text-reddanger absolute top-12">{props.errors.name}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="description" className="">Description <span className="text-xs text-reddanger">* required</span></label>
                            <div className='relative'>
                                <InputField value={props.values.description} id={"description"} type={"string"} name="description" onChange={props.handleChange} />
                                {props.errors.description && props.touched.description && <div className="text-sm text-reddanger absolute top-12">{props.errors.description}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="category_id" className="">Select Category <span className="text-xs text-reddanger">* required</span></label>
                            <div className='relative'>
                                <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='category_id'>
                                    <option key="empty" value=''>--choose a category--</option>
                                    {allCategory.map((category) => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </Field>
                                {props.errors.category_id && props.touched.category_id && <div className="text-sm text-reddanger absolute top-12">{props.errors.category_id}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="weight" className="">Weight <span className="text-xs text-reddanger">* required</span></label>
                            <div className='relative'>
                                <InputField value={props.values.weight} id={"weight"} type={"number"} name="weight" onChange={props.handleChange} />
                                {props.errors.weight && props.touched.weight && <div className="text-sm text-reddanger absolute top-12">{props.errors.weight}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="unitOfMeasurement" className="">Unit Of Measurement <span className="text-xs text-reddanger">* required</span></label>
                            <div className='relative'>
                                <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='unitOfMeasurement'>
                                    <option key="empty" value=''>--choose one below--</option>
                                    {uOMOptions.map((uOM) => (
                                        <option key={uOM.value} value={uOM.value}>
                                            {uOM.label}
                                        </option>
                                    ))}
                                </Field>
                                {props.errors.unitOfMeasurement && props.touched.unitOfMeasurement && <div className="text-sm text-reddanger absolute top-12">{props.errors.unitOfMeasurement}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="basePrice" className="">Base Price <span className="text-xs text-reddanger">* required</span></label>
                            <div className='relative'>
                                <InputField value={props.values.basePrice} id={"basePrice"} type={"number"} name="basePrice" onChange={props.handleChange} />
                                {props.errors.basePrice && props.touched.basePrice && <div className="text-sm text-reddanger absolute top-12">{props.errors.basePrice}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="storageInstruction" className="">Storage Instruction <span className="text-xs text-reddanger">* required</span></label>
                            <div className='relative'>
                                <InputField value={props.values.storageInstruction} id={"storageInstruction"} type={"string"} name="storageInstruction" onChange={props.handleChange} />
                                {props.errors.storageInstruction && props.touched.storageInstruction && <div className="text-sm text-reddanger absolute top-12">{props.errors.storageInstruction}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="storagePeriod" className="">Storage Period <span className="text-xs text-reddanger">* required</span></label>
                            <div className='relative'>
                                <InputField value={props.values.storagePeriod} id={"storagePeriod"} type={"string"} name="storagePeriod" onChange={props.handleChange} />
                                {props.errors.storagePeriod && props.touched.storagePeriod && <div className="text-sm text-reddanger absolute top-12">{props.errors.storagePeriod}</div>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 py-4 mb-24">
                            <label htmlFor="file" className="">Product Image <span className="text-xs text-reddanger">* required</span></label>
                            <div className='relative'>
                                <input className='border border-gray-300 text-xs w-full focus:border-darkgreen focus:ring-0' type="file" id="file" name="file" onChange={(e) => { props.setFieldValue("file", e.currentTarget.files[0]); }} required />
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
