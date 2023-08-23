import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import * as yup from "yup";
import { Field, Formik } from "formik";

import { getAllVoucherType } from "../../../api/promotion";
import InputField from "../../InputField";
import Modal from "../../Modal";
import AlertPopUp from "../../AlertPopUp";

export default function CreateVoucher() {
  const [dataAllVoucherType, setDataAllVoucherType] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const fetchDataAllVoucherType = async () => {
    try {
      const response = await getAllVoucherType();
      let options = response.data.data.map((d) => ({
        label: d.type,
        value: d.id,
      }));
      setDataAllVoucherType(options);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchDataAllVoucherType();
  }, []);

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

  const handleSubmit = async (values, actions) => {
    let token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/admins/vouchers`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 201) {
        actions.resetForm();
        setErrorMessage("");
        setSuccessMessage(response.data?.message);
        handleShowAlert("open");
      }
    } catch (error) {
      const response = error.response;
      if (response.data.message === "An error occurs") {
        const { msg } = response.data?.errors[0];
        if (msg) {
          setErrorMessage(`${msg}`);
        }
      }

      if (response.status === 400) {
        setErrorMessage(`${response.data.message}`);
      }
      if (response.data.error) {
        const errMsg = response.data.error;
        console.log(errMsg);

        setErrorMessage(`${errMsg}`);
        handleShowAlert("open");
      }
      if (response.status === 500) {
        setErrorMessage("Create voucher failed: Server error");
        handleShowAlert("open");
      }
      handleShowAlert("open");
    }
  };

  const createVoucherSchema = yup.object().shape({
    isReferral: yup.boolean(),
    
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
            voucher_type_id: "",
            isReferral: false,
            usedLimit: "",
            amount: "",
            expiredDate: "",
            minTransaction: "",
            maxDiscount: "",
          }}
          validationSchema={createVoucherSchema}
          onSubmit={handleSubmit}
        >
          {(props) => (
            <form>
              <div className="w-full">
                <div>
                  <label htmlFor="isReferral" className="font-inter">
                    referral code?
                    <span className="text-xs text-reddanger">* required</span>
                  </label>
                </div>
                <div>
                  <label>
                    <Field
                      type="radio"
                      name="isReferral"
                      value={true}
                      checked={props.values.isReferral === true}
                      onChange={() => props.setFieldValue("isReferral", true)}
                      className=" checked:bg-maingreen"
                      id="yes"
                    />
                    Yes
                  </label>
                  <label>
                    <Field
                      type="radio"
                      name="isReferral"
                      value={false}
                      checked={props.values.isReferral === false}
                      onChange={() => props.setFieldValue("isReferral", false)}
                      className=" checked:bg-maingreen"
                      id="no"
                    />
                    No
                  </label>
                </div>
                <label htmlFor="voucher_type_id" className="font-inter">
                  Voucher type
                  <span className="text-xs text-reddanger">* required</span>
                </label>
                <div>
                  <Field
                    as="select"
                    className="w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0"
                    name="voucher_type_id"
                  >
                    <option key="empty" value="">
                      --choose a voucher type--
                    </option>
                    {dataAllVoucherType.map((data) => (
                      <option key={data.value} value={data.value}>
                        {data.label}
                      </option>
                    ))}
                  </Field>
                  {props.errors.voucher_type_id &&
                    props.touched.voucher_type_id && (
                      <div className="text-sm text-reddanger">
                        {props.errors.voucher_type_id}
                      </div>
                    )}
                </div>
              </div>

              {props.values.voucher_type_id == 2 ||
              props.values.voucher_type_id == 3 ? (
                <div>
                  <div>
                    <label htmlFor="amount" className="font-inter">
                      amount
                      <span className="text-xs text-reddanger">* required</span>
                    </label>
                    <InputField
                      value={props.values.amount}
                      id="amount"
                      name="amount"
                      onChange={props.handleChange}
                    />
                    {props.errors.amount && props.touched.amount && (
                      <div className="text-sm text-reddanger top-12">
                        {props.errors.amount}
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="maxDiscount" className="font-inter">
                      Max Discount
                    </label>
                    <InputField
                      value={props.values.maxDiscount}
                      id="maxDiscount"
                      name="maxDiscount"
                      onChange={props.handleChange}
                    />
                    {props.errors.maxDiscount && props.touched.maxDiscount && (
                      <div className="text-sm text-reddanger top-12">
                        {props.errors.maxDiscount}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              {!props.values.isReferral && (
                <>
                  <div>
                    <label htmlFor="minTransaction" className="font-inter">
                      min. Transaction
                      <span className="text-xs text-reddanger">* required</span>
                    </label>
                    <InputField
                      value={props.values.minTransaction}
                      id="minTransaction"
                      name="minTransaction"
                      onChange={props.handleChange}
                    />
                    {props.errors.minTransaction &&
                      props.touched.minTransaction && (
                        <div className="text-sm text-reddanger top-12">
                          {props.errors.minTransaction}
                        </div>
                      )}
                  </div>

                  <div>
                    <label htmlFor="usedLimit" className="font-inter">
                      Usage limit
                      <span className="text-xs text-reddanger">* required</span>
                    </label>
                    <InputField
                      value={props.values.usedLimit}
                      id="usedLimit"
                      name="usedLimit"
                      onChange={props.handleChange}
                    />
                    {props.errors.usedLimit && props.touched.usedLimit && (
                      <div className="text-sm text-reddanger top-12">
                        {props.errors.usedLimit}
                      </div>
                    )}
                  </div>
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
                    {props.errors.expiredDate && props.touched.expiredDate && (
                      <div className="text-sm text-reddanger top-12">
                        {props.errors.expiredDate}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <Modal
                  modalTitle={"Create Voucher"}
                  toggleName={"Create Voucher"}
                  content={`Are you sure to create this voucher?`}
                  buttonCondition={"positive"}
                  buttonLabelOne={"Cancel"}
                  buttonLabelTwo={"Yes"}
                  buttonTypeOne={"button"}
                  buttonTypeTwo={"submit"}
                  onClickButton={props.handleSubmit}
                />
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}
