import React, { useState } from "react";
import * as yup from "yup";
import { Formik, Form } from "formik";
import Modal from "../../../Modal";
import InputField from "../../../InputField";
import AlertPopUp from "../../../AlertPopUp";
import axios from "axios";

export default function CreateCategory() {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const createCategorySchema = yup.object().shape({
    name: yup
      .string()
      .max(50, "Category name must not exceed 50 characters")
      .required("Category name is required"),
    file: yup.mixed(),
    // .test("required", "Please select a file", (value) => {
    //     return !!value || !!this.parent.name;
    // })
    // .test("fileSize", "The file size is too large", (value) => {
    //     return !value || (value[0] && value[0].size <= 1000000);
    // })
    // .test("type", "We only support jpg, jpeg, or png", (value) => {
    //     const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    //     return !value || (value[0] && supportedTypes.includes(value[0].type));
    // })
  });

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
        "http://localhost:8000/api/admins/category",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        resetForm();
        setErrorMessage("");
        setSuccessMessage(response.data?.message);
        handleShowAlert();
      }
    } catch (error) {
      const response = error.response;
      if (response.data.message === "An error occurs") {
        const { msg } = response.data?.errors[0];
        if (msg) {
          setStatus({ success: false, msg });
          setErrorMessage(`${msg}`);
          showAlert(true);
        }
      }
      if (response.data.error) {
        const errMsg = response.data.error;
        console.log(errMsg);
        setStatus({ success: false, errors: errMsg });
        setErrorMessage(`${errMsg}`);
        showAlert(true);
      }
      if (response.status === 500) {
        setErrorMessage("Create category failed: Server error");
        showAlert(true);
      }
      handleShowAlert();
      resetForm();
    } finally {
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

  return (
    <div className="w-8/12 mx-auto flex flex-col justify-center font-inter">
      {showAlert ? (
        <AlertPopUp
          condition={errorMessage ? "fail" : "success"}
          content={errorMessage ? errorMessage : successMessage}
          setter={handleHideAlert}
        />
      ) : null}
      <Formik
        initialValues={{ name: "", file: null }}
        validationSchema={createCategorySchema}
        onSubmit={handleSubmit}
      >
        {(props) => (
          <Form>
            <div className="flex flex-col gap-2 py-4 font-inter mb-4">
              <label htmlFor="name" className="">
                Category Name{" "}
                <span className="text-xs text-reddanger">* required</span>
              </label>
              <div className="relative">
                <InputField
                  value={props.values.name}
                  id={"name"}
                  type={"string"}
                  name="name"
                  onChange={props.handleChange}
                />
                {props.errors.name && props.touched.name && (
                  <div className="text-sm text-reddanger absolute top-12">
                    {props.errors.name}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 py-4 mb-4">
              <label htmlFor="file" className="">
                Category Image{" "}
                <span className="text-xs text-reddanger">* required</span>
              </label>
              <div className="relative">
                <input
                  className="border border-gray-300 text-xs w-full focus:border-darkgreen focus:ring-0"
                  type="file"
                  id="file"
                  name="file"
                  onChange={(e) => {
                    props.setFieldValue("file", e.currentTarget.files[0]);
                  }}
                  required
                />
                {props.errors.file && props.touched.file && (
                  <div className="text-sm text-reddanger absolute top-12">
                    {props.errors.file}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-20">
              <Modal
                isDisabled={
                  !props.dirty || !(props.values.name && props.values.file)
                }
                modalTitle={"Create New Category"}
                toggleName={"Create Category"}
                content={
                  "By creating this category, you're adding content for future accessibility. Are you sure?"
                }
                buttonCondition={"positive"}
                buttonLabelOne={"Cancel"}
                buttonLabelTwo={"Yes"}
                buttonTypeOne={"button"}
                buttonTypeTwo={"submit"}
                onClickButton={props.handleSubmit}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
