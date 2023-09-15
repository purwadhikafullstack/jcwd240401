import React, { useState, useRef } from "react";
import axios from "axios";
import * as yup from "yup";
import { Formik, Form } from "formik";

import Modal from "../../../Modal";
import InputField from "../../../InputField";
import AlertPopUp from "../../../AlertPopUp";
import handleImageError from "../../../../helpers/handleImageError";

export default function CreateCategory() {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token")
  const createCategorySchema = yup.object().shape({
    name: yup
      .string()
      .max(50, "Category name must not exceed 50 characters")
      .required("Category name is required")
      .typeError("Name must be a valid text"),
    file: yup.mixed().required("Category image is required"),
  });

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setStatus }
  ) => {
    const { name, file } = values;
    const formData = new FormData();
    formData.append("name", name);
    formData.append("file", file);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/admins/category`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );
      if (response.status === 201) {
        resetForm();
        resetFileInput();
        setErrorMessage("");
        setSuccessMessage(response.data?.message);
        handleShowAlert();
      }
    } catch (error) {
      console.log(error)
      const response = error.response;
      if (response.data.message === "An error occurs") {
        const { msg } = response.data?.errors[0];
        if (msg) {
          setStatus({ success: false, msg });
          setErrorMessage(`${msg}`);
        }
      }
      if (response?.data.error) {
        const errMsg = response?.data.error;
        console.log(errMsg);
        setStatus({ success: false, errors: errMsg });
        setErrorMessage(`${errMsg}`);
      }
      if (response.status === 500) {
        setErrorMessage("Create category failed: Server error");
      }
      handleShowAlert();
      resetForm();
    } finally {
      resetFileInput();
      setImagePreview(null)
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSubmitting(false);
    }
  };

  const handleShowAlert = () => {
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 4000);
  };

  const handleHideAlert = () => {
    setShowAlert(false);
  };

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
    <div className="w-full sm:w-8/12 mx-auto flex flex-col justify-center font-inter">
      {showAlert ? (
        <AlertPopUp
          condition={errorMessage ? "fail" : "success"}
          content={errorMessage ? errorMessage : successMessage}
          setter={handleHideAlert}
        />
      ) : null}
      <Formik enableReinitialize
        initialValues={{ name: "", file: null }}
        validationSchema={createCategorySchema}
        onSubmit={handleSubmit}
      >
        {(props) => (
          <Form>
            <div className="text-xs text-reddanger">* required</div>
            <div className="flex flex-col gap-2 py-4 font-inter mb-4">
              <label htmlFor="name" className="font-medium">
                Name{" "}
                <span className="text-sm font-normal">(max. 50 characters) </span>
                <span className="text-reddanger font-normal">*</span>
              </label>
              <div className="relative">
                <InputField value={props.values.name} id={"name"} type={"string"} name="name" onChange={props.handleChange} />
                {props.errors.name && props.touched.name && (<div className="text-sm text-reddanger absolute top-12"> {props.errors.name} </div>)}
              </div>
            </div>
            <div className="flex flex-col gap-2 py-4 mb-4">
              <label htmlFor="file" className="font-medium">
                Image{" "}
                <span className="text-sm font-normal">(.jpg, .jpeg, .png) max. 1MB </span>
                <span className="text-reddanger font-normal">*</span>
              </label>
              <div>
                {(imagePreview) ? (
                  <img
                    id="frame"
                    className="w-36 h-36 justify-center mx-auto m-2 object-cover border-2 border-maingreen p-1"
                    src={imagePreview}
                    onError={handleImageError}
                    alt="/"
                  />
                ) : (
                  <img
                    className="w-36 h-36 justify-center mx-auto m-2 object-cover border-2 border-maingreen p-1"
                    src={""}
                    onError={handleImageError}
                    alt="/"
                  />
                )}
              </div>
              <div className="relative">
                <input className="border border-gray-300 text-xs w-full focus:border-darkgreen focus:ring-0" type="file" id="file" name="file" onChange={(e) => { props.setFieldValue("file", e.currentTarget.files[0]); preview(e) }} required ref={fileInputRef}
                />
                {props.errors.file && props.touched.file && (<div className="text-sm text-reddanger absolute top-12"> {props.errors.file} </div>)}
              </div>
            </div>
            <div className="mt-20">
              <Modal isDisabled={!props.dirty || !(props.values.name && props.values.file)} modalTitle={"Create New Category"} toggleName={"Create Category"} content={"By creating this category, you're adding content for future accessibility. Are you sure?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={props.handleSubmit} />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
