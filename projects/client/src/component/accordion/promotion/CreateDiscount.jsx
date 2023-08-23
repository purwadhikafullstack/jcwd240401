import React, { useState, useEffect } from "react";
import axios from "axios";
import { Field, Formik } from "formik";
import * as yup from "yup";
import { Pagination } from "flowbite-react";

import getAllDiscountType from "../../../api/promotion";
import InputField from "../../InputField";
import Modal from "../../Modal";
import AlertPopUp from "../../AlertPopUp";

export default function CreateDiscount() {
  const [dataAllDiscountType, setDataAllDiscountType] = useState([]);
  const [dataBranchProduct, setDataBranchProduct] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const fetchDataAllDiscountType = async () => {
    try {
      const response = await getAllDiscountType();
      let options = response.data.data.map((d) => ({
        label: d.type,
        value: d.id,
      }));
      setDataAllDiscountType(options);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchDataAllBranchProduct = async () => {
    try {
      let token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/admins/my-branch/branch-products?page=${currentPage}&sortName=ASC`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDataBranchProduct(response.data.data.rows);
      setTotalPage(
        Math.ceil(
          response.data?.pagination?.totalData /
            response.data?.pagination?.perPage
        )
      );
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchDataAllDiscountType();
    fetchDataAllBranchProduct();
  }, [currentPage]);

  const handleShowAlert = (condition) => {
    if (condition) {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 4000);
    }
    if (!condition) {
      setShowAlert(false);
    }
  };

  const onPageChange = (page) => {
    setDataBranchProduct([]);
    setCurrentPage(page);
  };

  const handleSubmit = async (values, actions) => {
    let token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/admins/discounts`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        actions.resetForm();
        setErrorMessage("");
        setSuccessMessage(response.data?.message);
        handleShowAlert("open");
      }
    } catch (error) {
      const response = error.response;
      console.log(response.data);
      if (response.data.message === "An error occurs") {
        const { msg } = response.data?.errors[0];
        if (msg) {
          setErrorMessage(`${msg}`);
        }
      }
      console.log(errorMessage, "ini error mesek");
      if (response.data.error) {
        const errMsg = response.data.error;
        console.log(errMsg);

        setErrorMessage(`${errMsg}`);
        handleShowAlert("open");
      }
      if (response.status === 500) {
        setErrorMessage("Create discount failed: Server error");
        handleShowAlert("open");
      }
      handleShowAlert("open");
    }
  };

  const createDiscountSchema = yup.object().shape({
    discount_type_id: yup.number().required("discount type is required"),
    amount: yup
      .number()
      .typeError("amount must be a number")
      .when("discount_type_id", (discount_type_id, createDiscountSchema) => {
        if (discount_type_id == 2)
          return createDiscountSchema
            .min(1, "amount must be greater than 1")
            .max(100, "amount cannot be greater than 100")
            .required("amount is required");
        if (discount_type_id == 3)
          return createDiscountSchema
            .min(1, "amount must be greater than 1")
            .required("amount is required");
        return createDiscountSchema;
      }),

    expiredDate: yup
      .date()
      .typeError("expired date must be a date format")
      .min(new Date(), "expired date can't be in the past or today")
      .required("expired date is required"),
    products: yup.array().min(1, "you have to add atleast one product"),
  });

  return (
    <div className="flex flex-col w-5/6 mx-auto">
      {showAlert && (
        <AlertPopUp
          condition={errorMessage ? "fail" : "success"}
          content={errorMessage ? errorMessage : successMessage}
          setter={() => handleShowAlert(false)}
        />
      )}

      <div>
        <Formik
          initialValues={{
            discount_type_id: "",
            amount: "",
            expiredDate: "",
            products: [],
          }}
          validationSchema={createDiscountSchema}
          onSubmit={handleSubmit}
        >
          {(props) => (
            <form id="myDiscountForm">
              <div>
                <div className="flex flex-col gap-2 py-4 font-inter mb-4">
                  <label htmlFor="discount_type_id" className="">
                    Select discount type:
                    <span className="text-xs text-reddanger">* required</span>
                  </label>
                  <div className="relative">
                    <Field
                      as="select"
                      className="w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0"
                      name="discount_type_id"
                    >
                      <option key="empty" value="">
                        --choose a discount type--
                      </option>
                      {dataAllDiscountType.map((data) => (
                        <option key={data.value} value={data.value}>
                          {data.label}
                        </option>
                      ))}
                    </Field>
                    {props.errors.discount_type_id &&
                      props.touched.discount_type_id && (
                        <div className="text-sm text-reddanger absolute top-12">
                          {props.errors.discount_type_id}
                        </div>
                      )}
                  </div>
                </div>
              </div>
              {props.values.discount_type_id == 2 ||
              props.values.discount_type_id == 3 ? (
                <div>
                  <label htmlFor="amount" className="font-inter">
                    Discount amount:
                    <span className="text-xs text-reddanger">* required</span>
                  </label>
                  <InputField
                    value={props.values.amount}
                    id={"amount"}
                    name="amount"
                    onChange={props.handleChange}
                  />
                  {props.errors.amount && props.touched.amount && (
                    <div className="text-reddanger top-12">
                      {props.errors.amount}
                    </div>
                  )}
                </div>
              ) : (
                ""
              )}

              <div>
                <label htmlFor="expiredDate" className="font-inter">
                  Expired date
                  <span className="text-xs text-reddanger">* required</span>
                </label>
                <Field
                  type="date"
                  id="expiredDate"
                  name="expiredDate"
                  className="w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0"
                />
                {props.errors.expiredDate && (
                  <div className="text-reddanger top-12">
                    {props.errors.expiredDate}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="products" className="font-inter">
                  choose products
                  <span className="text-xs text-reddanger">* required</span>
                </label>
                <br />
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {dataBranchProduct.map((data) => (
                    <div role="group" aria-labelledby="checkbox-group">
                      <label>
                        <Field
                          type="checkbox"
                          name="products"
                          value={data.product_id}
                          className=" form-checkbox text-maindarkgreen rounded-sm mr-1 "
                          checked={props.values.products.includes(
                            data.product_id
                          )} 
                          onChange={() => {
                            
                            const updatedProducts =
                              props.values.products.includes(data.product_id)
                                ? props.values.products.filter(
                                    (id) => id !== data.product_id
                                  )
                                : [...props.values.products, data.product_id];
                            props.setFieldValue("products", updatedProducts);
                          }}
                        />
                        {data.Product.name} [ {data.Product.weight}
                        {data.Product.unitOfMeasurement} / pack ]
                      </label>
                    </div>
                  ))}
                  {props.errors.products && (
                    <div className="text-reddanger top-12">
                      {props.errors.products}
                    </div>
                  )}
                </div>
                <div className="flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                    showIcons
                    layout="pagination"
                    totalPages={totalPage}
                    nextLabel="Next"
                    previousLabel="Back"
                    className="mx-auto"
                  />
                </div>
              </div>
              <Modal
                modalTitle={"Create Discount"}
                toggleName={"Create Discount"}
                content={`Are you sure to create this voucher?`}
                buttonCondition={"positive"}
                buttonLabelOne={"Cancel"}
                buttonLabelTwo={"Yes"}
                buttonTypeOne={"button"}
                buttonTypeTwo={"submit"}
                onClickButton={props.handleSubmit}
              />
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}
