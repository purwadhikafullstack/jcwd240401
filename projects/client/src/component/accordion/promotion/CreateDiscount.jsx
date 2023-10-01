import React, { useState, useEffect } from "react";
import {
  getAllDiscountType,
  getDataAllBranchProduct,
  handleSubmitDiscount,
} from "../../../api/promotion";
import AlertPopUp from "../../AlertPopUp";
import { createDiscountSchema } from "../../../helpers/validationSchema";
import DiscountForm from "../../admin/BranchAdminPromotionContent/DiscountForm";

export default function CreateDiscount() {
  const [dataAllDiscountType, setDataAllDiscountType] = useState([]);
  const [dataBranchProduct, setDataBranchProduct] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const token = localStorage.getItem("token");

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
      const branchProducts = await getDataAllBranchProduct(token, currentPage);
      setDataBranchProduct(branchProducts.data?.rows);
      setTotalPage(
        Math.ceil(
          branchProducts.pagination?.totalData /
          branchProducts.pagination?.perPage
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
    try {
      const response = await handleSubmitDiscount(values, token);
      if (response.status === 200) {
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
      if (response.data.error) {
        const errMsg = response.data.error;

        setErrorMessage(`${errMsg}`);
        handleShowAlert("open");
      }
      if (response.status === 400) {
        console.log(error);
        setErrorMessage(response.data.message);
        setSuccessMessage("");
        handleShowAlert("open");
      }
      if (response.status === 500) {
        setErrorMessage("Create discount failed: Server error");
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
        <DiscountForm
          initialValues={{
            discount_type_id: "",
            amount: "",
            expiredDate: "",
            products: [],
          }}
          validationSchema={createDiscountSchema}
          onSubmit={handleSubmit}
          dataAllDiscountType={dataAllDiscountType}
          dataBranchProduct={dataBranchProduct}
          currentPage={currentPage}
          totalPage={totalPage}
          onPageChange={onPageChange}
          handleShowAlert={handleShowAlert}
        />
      </div>
    </div>
  );
}
