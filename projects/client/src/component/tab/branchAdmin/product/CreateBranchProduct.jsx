import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as yup from "yup";
import { Formik, Form, Field } from 'formik';

import Modal from '../../../Modal';
import InputField from '../../../InputField';
import AlertPopUp from '../../../AlertPopUp';

export default function CreateBranchProduct() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const [allUnaddedProduct, setAllUnaddedProduct] = useState([]);
    const [isProductSelected, setIsProductSelected] = useState(false)

    let token = localStorage.getItem("token")
    const getUnaddedProduct = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/unadded-products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                const data = response.data.data;
                if (data) {
                    let options = data.map((d) => ({
                        label: `${d.name} [ ${d.weight}${d.unitOfMeasurement} / pack ]`,
                        value: d.id,
                    }));
                    setAllUnaddedProduct(options);
                } else {
                    setAllUnaddedProduct([]);
                }
            }
        } catch (error) {
            console.log("ini error", error);
        }
    }
    const createBranchProductSchema = yup.object().shape({
        product_id: yup.string().trim().required("Product is required"),
        origin: yup.string().trim().required("Origin is required").max(50, "Maximum character is 50").typeError("Origin must be a valid text"),
        quantity: yup.number().required("Quantity is required").min(1, "Quantity must be at least 1").typeError('Quantity must be a valid number'),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm, setStatus }) => {
        console.log("berhasil click submit")
        console.log(values)
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products`, values, {
                headers: { Authorization: `Bearer ${token}` }
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
            if (response.data.error) {
                const errMsg = response.data.error;
                console.log(errMsg)
                setStatus({ success: false, errors: errMsg });
                setErrorMessage(`${errMsg}`);
            }
            if (response.status === 500) {
                setErrorMessage("Create branch product failed: Server error")
            }
            handleShowAlert()
            resetForm()
        } finally {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setSubmitting(false);
            setIsProductSelected(false)
            getUnaddedProduct()
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
        getUnaddedProduct()
    }, [])

    return (
        <div className='w-full sm:w-8/12 mx-auto flex flex-col justify-center font-inter'>
            {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert} />) : (null)}
            <Formik initialValues={{ product_id: "", origin: "", quantity: "" }} validationSchema={createBranchProductSchema} onSubmit={handleSubmit}>
                {(props) => (
                    <Form>
                        <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                            <label htmlFor="product_id" className="font-semibold text-maindarkgreen">Select a Product: <span className="text-reddanger font-normal">* required</span></label>
                            <div className='relative'>
                                <Field as='select' className='w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0' name='product_id' onChange={(e) => { props.handleChange(e); setIsProductSelected(!!e.target.value); }} disabled={allUnaddedProduct.length === 0}>
                                    <option key="empty" value=''>--choose a product--</option>
                                    {allUnaddedProduct.map((product) => (
                                        <option key={product.value} value={product.value}>
                                            {product.label}
                                        </option>
                                    ))}
                                </Field>
                                {props.errors.product_id && props.touched.product_id && <div className="text-sm text-reddanger absolute top-12">{props.errors.product_id}</div>}
                            </div>
                        </div>
                        <hr className='mb-4' />
                        {!(allUnaddedProduct.length === 0) && isProductSelected && (
                            <>
                                <div className="text-xs text-reddanger">* required</div>
                                <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                    <label htmlFor="origin" className="font-medium">Origin <span className="text-sm font-normal">(max. 50 characters) </span><span className="text-reddanger">*</span></label>
                                    <div className='relative'>
                                        <InputField value={props.values.origin} id={"origin"} type={"string"} name="origin" onChange={props.handleChange} />
                                        {props.errors.origin && props.touched.origin && <div className="text-sm text-reddanger absolute top-12">{props.errors.origin}</div>}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                                    <label htmlFor="quantity" className="font-medium">Quantity <span className="text-sm font-normal">(min. 1) </span><span className="text-reddanger">*</span></label>
                                    <div className='relative'>
                                        <InputField value={props.values.quantity} id={"quantity"} type={"number"} name="quantity" onChange={props.handleChange} />
                                        {props.errors.quantity && props.touched.quantity && <div className="text-sm text-reddanger absolute top-12">{props.errors.quantity}</div>}
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <Modal isDisabled={!props.dirty || !props.isValid} modalTitle={"Create New Branch Product"} toggleName={"Create Branch Product"} content={"By creating this branch product, you're adding content for future accessibility. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} buttonTypeToggle={"button"} />
                                </div>
                            </>
                        )}
                        {!(allUnaddedProduct.length === 0) && !isProductSelected && (
                            <div className='font-inter text-center text-maingreen w-11/12 mx-auto'>Please select a product to create a branch product</div>
                        )}
                        {allUnaddedProduct.length === 0 && <div className='font-inter text-center text-maingreen w-11/12 mx-auto'>All products already exist in your branch.</div>}
                    </Form>
                )}
            </Formik>
        </div >
    )
}
