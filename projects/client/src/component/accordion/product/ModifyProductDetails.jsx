import React, { useState, useEffect } from 'react';
import { Formik, Form } from "formik";
import axios from "axios";

import Modal from '../../Modal';
import InputField from '../../InputField';
import { modifyBranchProductDetailsSchema } from '../../../helpers/validationSchema';
import AlertHelper from '../../../helpers/AlertHelper';

export default function ModifyProductDetails({ branchProductId }) {
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [branchProductDetails, setBranchProductDetails] = useState({
    origin: "",
  })
  const token = localStorage.getItem("token")

  const getOneBranchProduct = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products/${branchProductId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        const data = response.data.data;
        if (data) {
          setBranchProductDetails({
            origin: data.origin,
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
    try {
      const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products/${branchProductId}/modify`, values, {
        headers: { Authorization: `Bearer ${token}` }
      })
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
      if (response.status === 500) {
        setErrorMessage("Modify branch product details failed: Server error")
      }
      resetForm()
    } finally {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSubmitting(false);
    }
  };

  useEffect(() => {
    getOneBranchProduct()
  }, [successMessage, errorMessage,])
  return (
    <div className="w-5/6 mx-auto flex flex-col justify-center font-inter">
      <AlertHelper successMessage={successMessage} errorMessage={errorMessage} />
      <div className="flex flex-col gap-2 py-6">
        <div className=''>
          Modify Below:
        </div>
        <Formik enableReinitialize initialValues={{ origin: branchProductDetails.origin }} validationSchema={modifyBranchProductDetailsSchema} onSubmit={handleSubmit}>
          {(props) => (
            <Form>
              <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                <label htmlFor="name" className="">Origin <span className="text-xs text-reddanger">* required</span></label>
                <div className='relative'>
                  <InputField value={props.values.origin} id={"origin"} type={"string"} name="origin" onChange={props.handleChange} />
                  {props.errors.origin && props.touched.origin && <div className="text-reddanger absolute top-12">{props.errors.origin}</div>}
                </div>
              </div>
              <div className="mt-8">
                <Modal isDisabled={!props.dirty} modalTitle={"Modify Product's Detail"} toggleName={"Modify Details"} content={"Editing this branch product's detail will permanently change it. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
