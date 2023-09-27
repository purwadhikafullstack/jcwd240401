import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';

import Modal from '../../../Modal';
import InputField from '../../../InputField';
import { createBranchProductSchema } from '../../../../helpers/validationSchema';
import AlertHelper from '../../../AlertHelper';
import { createBranchProduct } from '../../../../api/branchProduct';
import { getUnaddedProducts } from '../../../../api/product';

export default function CreateBranchProduct() {
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [allUnaddedProduct, setAllUnaddedProduct] = useState([]);
    const [isProductSelected, setIsProductSelected] = useState(false)

    const token = localStorage.getItem("token")
    const getUnaddedProduct = async () => {
        try {
            const response = await getUnaddedProducts(token)
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
            console.log(error.message);
        }
    }

    const handleSubmit = async (values, { setSubmitting, resetForm, setStatus }) => {
        const { product_id, origin, quantity } = values
        try {
            const response = await createBranchProduct(token, { product_id, origin, quantity })
            if (response.status === 201) {
                resetForm()
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
            if (response.data.error) {
                const errMsg = response.data.error;
                console.log(errMsg)
                setStatus({ success: false, errors: errMsg });
                setErrorMessage(`${errMsg}`);
            }
            if (response.status === 500) {
                setErrorMessage("Create branch product failed: Server error")
            }
            resetForm()
        } finally {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setSubmitting(false);
            setIsProductSelected(false)
            getUnaddedProduct()
        }
    };

    useEffect(() => {
        getUnaddedProduct()
    }, [])

    return (
        <div className='w-full sm:w-8/12 mx-auto flex flex-col justify-center font-inter'>
            <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
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
                                    <Modal buttonTypeToggle={"button"} isDisabled={!props.dirty || !props.isValid} modalTitle={"Create New Branch Product"} toggleName={"Create Branch Product"} content={"By creating this branch product, you're adding content for future accessibility. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} />
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
