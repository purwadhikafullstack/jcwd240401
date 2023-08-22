import React, { useState, useEffect } from 'react';
import axios from "axios";
import * as yup from "yup";
import { Formik, Form, Field } from "formik";

import Modal from '../../Modal';
import AlertPopUp from '../../AlertPopUp';
import InputField from '../../InputField';
import CustomDropdown from '../../CustomDropdown';

export default function ModifyProductStocks() {
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [allBranchProduct, setAllBranchProduct] = useState([])
  const [selectedBranchProductId, setSelectedBranchProductId] = useState("")
  const [branchProductDetails, setBranchProductDetails] = useState({
    quantity: "",
  })

  let token = localStorage.getItem("token")

  const modifyBranchProductSchema = yup.object().shape({
    quantity: yup.number().required("Quantity is required").min(1, "Quantity must be at least 1").typeError('Quantity must be a valid number'),
  });


  const getBranchProduct = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/no-pagination-branch-products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        const data = response.data.data;
        if (data) {
          let options = data.map((d) => ({
            label: `${d.Product?.name} [ ${d.Product?.weight}${d.Product.unitOfMeasurement} / pack ]`,
            value: d.id,
          }));
          setAllBranchProduct(options);
        } else {
          setAllBranchProduct([]);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }

  const getOneBranchProduct = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products/${selectedBranchProductId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products/${selectedBranchProductId}/stock/${action}`, { quantity: quantity }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.status === 200) {
        resetForm({ values: initialValues })
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
      if (response.status === 400) {
        setErrorMessage(response?.data?.message)
      }
      if (response.status === 500) {
        setErrorMessage("Modify branch product stock failed: Server error")
      }
      handleShowAlert()
      resetForm()
    } finally {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSubmitting(false);
      setBranchProductDetails("")
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

  const handleChangeDropdown = (obj) => {
    setSelectedBranchProductId(obj.value)
  };

  useEffect(() => {
    getBranchProduct()
    if (selectedBranchProductId) {
      getOneBranchProduct()
    }
  }, [successMessage, errorMessage, selectedBranchProductId])
  return (
    <div className="w-5/6 mx-auto flex flex-col justify-center font-inter">
      {showAlert ? (<AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert} />) : (null)}
      <div className="flex flex-col gap-2 py-4 font-inter border-b-2 pb-10">
        <div className="">
          Selected Branch Product: <span className="text-xs text-reddanger">* required</span>
        </div>
        <CustomDropdown options={allBranchProduct} onChange={handleChangeDropdown} placeholder={"--select a branch product to modify--"} />
      </div>
      <div className='flex flex-col gap-2 py-6'>
        {(selectedBranchProductId) ? (
          <>
            <div className="font-semibold">
              Stock: {branchProductDetails.quantity} Qty
            </div>
            <div className="pt-4">
              Modify Below:
            </div>
            <Formik enableReinitialize initialValues={{ action: "", quantity: "" }} validationSchema={modifyBranchProductSchema} onSubmit={handleSubmit}>
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
                    <Modal isDisabled={!props.dirty || !props.isValid} modalTitle={"Modify Product's Stock"} toggleName={"Modify Stock"} content={"Editing this branch product's stock will permanently change it. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} />
                  </div>
                </Form>
              )}
            </Formik> </>
        ) : (
          <div className='text-center text-darkgrey'>No Branch Product Selected</div>
        )}
      </div>
    </div>
  )
}