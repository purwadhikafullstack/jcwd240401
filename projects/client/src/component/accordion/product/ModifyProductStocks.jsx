import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from "formik";

import Modal from '../../Modal';
import InputField from '../../InputField';
import { modifyBranchProductQuantitySchema } from '../../../helpers/validationSchema';
import AlertHelper from '../../AlertHelper';
import { getBranchProductById, modifyBranchProductStock } from '../../../api/branchProduct';

export default function ModifyProductStocks({ branchProductId }) {
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [branchProductDetails, setBranchProductDetails] = useState({
    quantity: "",
  })
  const token = localStorage.getItem("token")

  const getOneBranchProduct = async () => {
    try {
      const response = await getBranchProductById(token, branchProductId)
      if (response.data) {
        const data = response.data.data;
        if (data) {
          setBranchProductDetails({
            quantity: data.quantity,
          })
        } else {
          setBranchProductDetails([]);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }

  const handleSubmit = async (values, { setSubmitting, resetForm, setStatus, initialValues }) => {
    const { action, quantity } = values
    try {
      const response = await modifyBranchProductStock(token, branchProductId, action, quantity)
      if (response.status === 200) {
        resetForm({ values: initialValues })
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
      if (response.status === 400) {
        setErrorMessage(response?.data?.message)
      }
      if (response.status === 500) {
        setErrorMessage("Modify branch product stock failed: Server error")
      }
      resetForm()
    } finally {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSubmitting(false);
      setBranchProductDetails("")
    }
  };

  useEffect(() => {
    getOneBranchProduct()
  }, [successMessage, errorMessage,])

  return (
    <div className="w-5/6 mx-auto flex flex-col justify-center font-inter">
      <AlertHelper successMessage={successMessage} errorMessage={errorMessage} setSuccessMessage={setSuccessMessage} setErrorMessage={setErrorMessage} />
      <div className='flex flex-col gap-2 py-6'>
        <div className="font-semibold">
          Stock: {branchProductDetails.quantity} Qty
        </div>
        <div className="pt-4">
          Modify Below:
        </div>
        <Formik enableReinitialize initialValues={{ action: "", quantity: "" }} validationSchema={modifyBranchProductQuantitySchema} onSubmit={handleSubmit}>
          {(props) => (
            <Form className="flex flex-col gap-2">
              <div className="grid grid-cols-1 md:grid-cols-2 justify-around gap-4 items-center">
                <div className="flex flex-col gap-2 py-4 font-inter justify-center">
                  <label>
                    <Field
                      type="radio"
                      name="action"
                      value={"plus"}
                      checked={props.values.action === "plus"}
                      onChange={() => props.setFieldValue("action", "plus")}
                      className=" checked:bg-maingreen mx-2 focus:ring-0"
                      id="add"
                    />
                    Add
                  </label>
                  <label>
                    <Field
                      type="radio"
                      name="action"
                      value={"minus"}
                      checked={props.values.action === "minus"}
                      onChange={() => props.setFieldValue("action", "minus")}
                      className=" checked:bg-maingreen mx-2 focus:ring-0"
                      id="subtract"
                    />
                    Subtract
                  </label>
                </div>
                <div className="flex flex-col gap-2 py-4 font-inter">
                  <label htmlFor="quantity" className="">Quantity <span className="text-xs text-reddanger">* required</span></label>
                  <div className='relative'>
                    <InputField value={props.values.quantity} id={"quantity"} type={"number"} name="quantity" onChange={props.handleChange} />
                    {props.errors.quantity && props.touched.quantity && <div className="text-reddanger absolute top-12">{props.errors.quantity}</div>}
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Modal buttonTypeToggle={"button"} isDisabled={!props.dirty || !props.isValid} modalTitle={"Modify Product's Stock"} toggleName={"Modify Stock"} content={"Editing this branch product's stock will permanently change it. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
