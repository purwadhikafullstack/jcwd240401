import React from "react";
import { useState, useEffect } from "react";

import { getAllVoucherType, handleSubmitVoucher } from "../../../api/promotion";
import AlertPopUp from "../../AlertPopUp";
import VoucherForm from "../../admin/BranchAdminPromotionContent/VoucherForm";

export default function CreateVoucher() {
  const [dataAllVoucherType, setDataAllVoucherType] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const token = localStorage.getItem("token");
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
    try {
      const response = await handleSubmitVoucher(values, token);
      if (response.status === 201) {
        actions.resetForm();
        setErrorMessage("");
        setSuccessMessage(response.data?.message);
        handleShowAlert("open");
      }
    } catch (error) {
      const response = error.response;
      if (response.data?.message === "An error occurs") {
        const { msg } = response.data?.errors[0];
        if (msg) {
          setErrorMessage(`${msg}`);
          handleShowAlert("open")
        }
      }

      if (response.status === 400) {
        setErrorMessage(`${response.data?.message}`);
        handleShowAlert("open")
      }
      if (response.data?.error) {
        const errMsg = response.data?.error;
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
        <VoucherForm
          dataAllVoucherType={dataAllVoucherType}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
