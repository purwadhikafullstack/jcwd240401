import React, { useState, useEffect } from "react";
import * as yup from "yup";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateCart } from "../../store/reducer/cartSlice";

import Modal from "../Modal";
import AlertPopUp from "../AlertPopUp";
import Button from "../Button";
import Label from "../Label";
import rupiah from "../../helpers/rupiah";

export default function SingleProductContent() {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [branchProductData, setBranchProductData] = useState({});
  const [quantity, setQuantity] = useState(1);
  const { name } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const getOneBranchProduct = async () => {
    try {
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_BASE_URL
        }/users/branch-products/${encodeURIComponent(name)}`
      );
      if (response.data) {
        const data = response.data.data;

        if (data) {
          setBranchProductData(data);
        } else {
          setBranchProductData([]);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  };

  useEffect(() => {
    getOneBranchProduct();
  }, [successMessage]);

  const handleImageError = (event) => {
    event.target.src =
      "https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg";
  };

  const handleQuantityChange = (action) => {
    if (action === "increase") {
      setQuantity((prevQuantity) => prevQuantity + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  const handleHideAlert = () => {
    setShowAlert(false);
  };

  const handleAddToCart = async (qty, id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/users/carts/${id}`,
        { quantity: qty },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response, "ini response");
      if (response.status == 200) {
        setSuccessMessage(response.data.message);
        setShowAlert(true);
        setQuantity(1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {branchProductData.length !== 0 ? (
        <div className="sm:py-4 sm:px-2 flex flex-col font-inter w-full sm:max-w-3xl mx-auto">
          <div className="">
            <div className="hidden sm:flex justify-between">
              <div className="grid justify-center content-center">
                <Button condition={"back"} onClick={goBack} />
              </div>
              <div className="flex mx-auto">
                {showAlert ? (
                  <AlertPopUp
                    condition={errorMessage ? "fail" : "success"}
                    content={errorMessage ? errorMessage : successMessage}
                    setter={handleHideAlert}
                  />
                ) : null}
                <div className="text-xl font-bold px-2">
                  {branchProductData?.Product?.name}
                </div>
                <div className="text-sm text-darkgrey px-2 flex items-center">{`${branchProductData?.Product?.weight}${branchProductData?.Product?.unitOfMeasurement} / pack`}</div>
              </div>
            </div>
          </div>
          <div className="sm:grid sm:grid-cols-2 sm:gap-4 sm:mt-9">
            <div>
              <div className="grid h-full content-center">
                <div className="relative h-fit">
                  <div className="absolute top-3 left-1 grid justify-center content-center sm:hidden">
                    <Button condition={"back"} onClick={goBack} />
                  </div>
                  {branchProductData.discount_id &&
                  branchProductData.Discount?.isExpired === false ? (
                    <div className="absolute bottom-0 left-0 h-8 w-full bg-reddanger flex justify-start text-sm items-center text-white font-inter px-4 sm:rounded-b-lg">
                      {branchProductData.Discount.discount_type_id === 1
                        ? "Buy 1 Get 1"
                        : "Discount"}
                    </div>
                  ) : null}
                  <img
                    className="w-full h-fit justify-center mx-auto object-cover sm:rounded-lg"
                    src={`${process.env.REACT_APP_BASE_URL}${branchProductData?.Product?.imgProduct}`}
                    onError={handleImageError}
                    alt="/"
                  />
                </div>
              </div>
              <div className="sm:hidden grid p-4">
                <div>{branchProductData?.Product?.name}</div>
                <div className="text-sm text-darkgrey flex items-center">{`${branchProductData?.Product?.weight}${branchProductData?.Product?.unitOfMeasurement} / pack`}</div>
                <div className="py-3">
                  {" "}
                  {branchProductData.discount_id &&
                  branchProductData?.Discount?.isExpired === false ? (
                    <>
                      {branchProductData.Discount.discount_type_id === 1 ? (
                        <div className="text-reddanger font-bold">
                          {rupiah(branchProductData.Product.basePrice)}
                        </div>
                      ) : branchProductData.Discount.discount_type_id === 2 ? (
                        <>
                          <div className="text-reddanger font-bold">
                            {rupiah(
                              branchProductData.Product.basePrice -
                                (branchProductData.Product.basePrice *
                                  branchProductData.Discount.amount) /
                                  100
                            )}
                          </div>
                          <div className="text-xs flex items-center gap-3">
                            <div>
                              <Label
                                labelColor={"red"}
                                text={`${branchProductData.Discount.amount} %`}
                              />
                            </div>
                            <del>
                              {rupiah(branchProductData.Product.basePrice)}
                            </del>
                          </div>
                        </>
                      ) : branchProductData.Discount.discount_type_id === 3 ? (
                        <>
                          <div className="text-reddanger font-bold">
                            {rupiah(
                              branchProductData.Product.basePrice -
                                branchProductData.Discount.amount
                            )}
                          </div>
                          <div className="text-xs flex items-center gap-3">
                            <del>
                              {rupiah(branchProductData.Product.basePrice)}
                            </del>
                          </div>
                        </>
                      ) : null}
                    </>
                  ) : (
                    <div className="text-reddanger font-bold">
                      {rupiah(branchProductData?.Product?.basePrice)}
                    </div>
                  )}{" "}
                </div>
              </div>
            </div>
            <div>
              <div className="p-4 bg-lightgrey w-full h-fit text-darkgrey text-sm">
                {branchProductData?.Product?.description}
              </div>
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="py-2 text-left" colSpan={2}>
                        Product Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr>
                      <td
                        className="py-2 text-maindarkgreen align-top"
                        style={{ width: "40%" }}
                      >
                        Stock
                      </td>
                      <td className="p-2" style={{ width: "60%" }}>
                        {branchProductData?.quantity} Qty
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="py-2 text-maindarkgreen align-top"
                        style={{ width: "40%" }}
                      >
                        Origin
                      </td>
                      <td className="p-2" style={{ width: "60%" }}>
                        {branchProductData?.origin}
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="py-2 text-maindarkgreen align-top"
                        style={{ width: "40%" }}
                      >
                        Storage Instruction
                      </td>
                      <td className="p-2" style={{ width: "60%" }}>
                        {branchProductData?.Product?.storageInstruction}
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="py-2 text-maindarkgreen align-top"
                        style={{ width: "40%" }}
                      >
                        Storage Period
                      </td>
                      <td className="p-2" style={{ width: "60%" }}>
                        {branchProductData?.Product?.storagePeriod}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 hidden sm:block">
                {branchProductData.discount_id &&
                branchProductData?.Discount?.isExpired === false ? (
                  <>
                    {branchProductData.Discount.discount_type_id === 1 ? (
                      <div className="text-reddanger font-bold">
                        {rupiah(branchProductData.Product.basePrice)}
                      </div>
                    ) : branchProductData.Discount.discount_type_id === 2 ? (
                      <>
                        <div className="text-reddanger font-bold">
                          {rupiah(
                            branchProductData.Product.basePrice -
                              (branchProductData.Product.basePrice *
                                branchProductData.Discount.amount) /
                                100
                          )}
                        </div>
                        <div className="text-xs flex items-center gap-3">
                          <div>
                            <Label
                              labelColor={"red"}
                              text={`${branchProductData.Discount.amount} %`}
                            />
                          </div>
                          <del>
                            {rupiah(branchProductData.Product.basePrice)}
                          </del>
                        </div>
                      </>
                    ) : branchProductData.Discount.discount_type_id === 3 ? (
                      <>
                        <div className="text-reddanger font-bold">
                          {rupiah(
                            branchProductData.Product.basePrice -
                              branchProductData.Discount.amount
                          )}
                        </div>
                        <div className="text-xs flex items-center gap-3">
                          <del>
                            {rupiah(branchProductData.Product.basePrice)}
                          </del>
                        </div>
                      </>
                    ) : null}
                  </>
                ) : (
                  <div className="text-reddanger font-bold">
                    {rupiah(branchProductData?.Product?.basePrice)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="basis-1/2 flex justify-around content-center items-center">
              <Button
                condition={"minus"}
                size={"3xl"}
                onClick={(e) => handleQuantityChange("decrease")}
              />
              <div className="h-fit">{quantity}</div>
              <Button
                condition={"plus"}
                size={"3xl"}
                onClick={(e) => handleQuantityChange("increase")}
              />
            </div>
            <div className="basis-1/2 p-4">
              <Button
                condition={"positive"}
                label={"Add to Cart"}
                onClick={(e) => handleAddToCart(quantity, branchProductData.id)}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-maingreen text-center mx-auto px-5">
          Loading...
        </div>
      )}
    </>
  );
}
