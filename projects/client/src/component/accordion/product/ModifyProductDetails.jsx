import React, { useState, useEffect } from 'react';
import { Formik, Form } from "formik";
import * as yup from "yup";
import axios from "axios";

import Modal from '../../Modal';
import AlertPopUp from '../../AlertPopUp';
import InputField from '../../InputField';
import CustomDropdown from '../../CustomDropdown';

export default function ModifyProductDetails() {
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [allBranchProduct, setAllBranchProduct] = useState([])
  const [selectedBranchProductId, setSelectedBranchProductId] = useState("")
  const [branchProductDetails, setBranchProductDetails] = useState({
    origin: "",
  })

  const modifyBranchProductSchema = yup.object().shape({
    origin: yup.string().trim().required("Origin is required").max(50, "Maximum character is 50"),
  });

  let token = localStorage.getItem("token")

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
      const response = await axios.patch(`${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products/${selectedBranchProductId}/modify`, values, {
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
      if (response.status === 500) {
        setErrorMessage("Modify branch product details failed: Server error")
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
      <div className="flex flex-col gap-2 py-6">
        {(selectedBranchProductId) ? (
          <><div className=''>
            Modify Below:
          </div>
            <Formik enableReinitialize initialValues={{ origin: branchProductDetails.origin }} validationSchema={modifyBranchProductSchema} onSubmit={handleSubmit}>
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
            </Formik> </>
        ) : (
          <div className='text-center text-darkgrey'>No Branch Product Selected</div>
        )}
      </div>
    </div>
  )
}
