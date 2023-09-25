import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as yup from "yup";
import rupiah from "../../helpers/rupiah";
import Modal from "../../component/Modal";
import CheckoutItem from "../../component/user/CheckoutItem";
import ModalCancelOrder from "../../component/ModalCancelOrder";
import AlertPopUp from "../../component/AlertPopUp";
import Label from "../../component/Label";
import Button from "../../component/Button";

export default function Payment() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [orderData, setOrderData] = useState(null);
  const [timer, setTimer] = useState(null);
  const [subTotal, setSubTotal] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [grandTotal, setGrandTotal] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  const fetchOrder = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/order/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.data?.voucher_id) {
        setSelectedVoucher(response.data?.data?.Voucher?.maxDiscount);
      }
      setDeliveryFee(response.data.data.shippingCost);
      setOrderStatus(response.data.data.orderStatus);
      setOrderData(response.data);
      setGrandTotal(response.data.data.totalPrice);
      const calculatedSubTotal = calculateSubTotalPrice(
        response.data?.data?.Branch_Products
      );
      setSubTotal(calculatedSubTotal);
      console.log(response?.data?.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  const calculateSubTotalPrice = (responseData) => {
    let total = 0;

    if (responseData?.length > 0) {
      // Calculate only if items are selected
      for (const item of responseData) {
        const basePrice = item.Product.basePrice; // Use the product's base price
        const quantity = item.Order_Item?.quantity;
        const discount = item.Discount;
        const expired = item.Discount?.isExpired;
        if (discount && !expired) {
          if (discount.discount_type_id === 2) {
            const discountAmount = discount.amount;
            total += ((basePrice * (100 - discountAmount)) / 100) * quantity;
          } else if (discount.discount_type_id === 3) {
            const discountAmount = discount.amount;
            total += (basePrice - discountAmount) * quantity;
          } else if (discount.discount_type_id === 1) {
            // Adjust the calculation for "buy one get one" discount
            const discountAmount = discount.amount;
            // Calculate the total price as if it's only one item, not two
            total += basePrice;
          }
        } else {
          total += basePrice * quantity;
        }
      }
    }

    return total;
  };

  const handleCancel = async (body, id) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/users/orders/${id}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        navigate("/user/orders");
      }
    } catch (error) {
      console.log(error);
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

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setStatus }
  ) => {
    const { file } = values;
    const formData = new FormData();
    formData.append("file", file);
    console.log("test");
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/users/payment/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201) {
        resetForm();
        setErrorMessage("");
        setSuccessMessage(response.data?.message);
        handleShowAlert();
        setOrderStatus("Waiting for payment confirmation");
      }
    } catch (error) {
      console.log(error);
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
        setErrorMessage("payment failed: Server error");
      }
      handleShowAlert();
      resetForm();
    } finally {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/users/confirm-order/${id}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        navigate("/user/orders");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const labelColor = (text) => {
    switch (text) {
      case "Waiting for payment":
        return "gray";
        break;
      case "Waiting for payment confirmation":
        return "purple";
        break;
      case "Processing":
        return "yellow";
        break;
      case "Delivering":
        return "blue";
        break;
      case "Order completed":
        return "green";
        break;
      case "Canceled":
        return "red";
        break;
      default:
        return "";
        break;
    }
  };

  const paymentSchema = yup.object().shape({
    file: yup.mixed().required("Category image is required"),
  });

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [orderStatus]);

  // Update the countdown timer every second
  useEffect(() => {
    if (orderData && orderData.data && orderData.data.orderDate) {
      // Calculate the initial time remaining based on the createdAt timestamp
      const createdAtTimestamp = Date.parse(new Date(orderData.data.orderDate));
      const currentTime = Date.now();
      const timeElapsed = Math.floor((currentTime - createdAtTimestamp) / 1000);
      const initialTimeRemaining = Math.max(30 * 60 - timeElapsed, 0);

      setTimer(initialTimeRemaining);

      const countdown = () => {
        if (timer > 0) {
          setTimer(timer - 1);
          setTimeout(countdown, 1000); // Schedule the next update
        } else {
          // Timer reached zero, trigger cancellation here
          console.log("cancel order");
          if (orderStatus === "Waiting for payment") {
            handleCancel({ cancelReason: "time has run out" }, id);
          }
        }
      };

      const countdownTimeout = setTimeout(countdown, 1000); // Start the countdown

      // Cleanup the timeout when the component unmounts
      return () => {
        clearTimeout(countdownTimeout);
      };
    }
  }, [timer, orderData]);

  return (
    <div>
      {orderData ? (
        <div className="flex flex-col justify-center items-center">
          {showAlert ? (
            <AlertPopUp
              condition={errorMessage ? "fail" : "success"}
              content={errorMessage ? errorMessage : successMessage}
              setter={handleHideAlert}
            />
          ) : null}
          <div className="w-full lg:w-4/6">
            <div className="flex sticky top-0 z-10 sm:static bg-white py-3 lg:pt-10">
              <div className="grid justify-center content-center">
                <Button condition={"back"} onClick={() => navigate("/user/orders")} />
              </div>
              <div className="text-xl sm:text-3xl sm:font-bold sm:text-maingreen sm:mx-auto px-6">
                Invoice - <span className="text-reddanger">{orderData.data.invoiceCode}</span>
              </div>
            </div>
            {/* <div className="text-xl lg:text-2xl font-semibold text-reddanger text-center pb-2">
              {orderData.data.invoiceCode}
            </div> */}
            {orderStatus === "Waiting for payment" && (
              <div className="text-reddanger text-xl font-bold ">
                Time remaining: {Math.floor(timer / 60)}:
                {(timer % 60).toString().padStart(2, "0")}
              </div>
            )}
            <div className="flex flex-row">
              <span className="text-maingreen font-semibold pt-1">
                Order Status:
              </span>
              <span className="mx-2">
                <Label
                  text={orderStatus}
                  labelColor={labelColor(orderStatus)}
                />
              </span>
            </div>

            <div className="text-maingreen font-semibold">My Order Summary</div>
            {orderData.data.Branch_Products.map((product) => (
              <CheckoutItem
                key={product?.id}
                quantity={product.Order_Item?.quantity}
                name={product.Product.name}
                weight={product.Product.weight}
                UOM={product.Product.unitOfMeasurement}
                productImg={product.Product.imgProduct}
                discountId={product.Discount?.id}
                discountType={product.Discount?.discount_type_id}
                isExpired={product.Discount?.isExpired}
                basePrice={product.Product?.basePrice}
                discountAmount={product.Discount?.amount}
                productStock={product.quantity}
                cartId={product?.id}
                productId={product?.id}
              />
            ))}

            <div className="flex justify-between">
              <span className="font-semibold text-xl text-maingreen">
                Sub total
              </span>
              <span className="text-reddanger text-xl font-bold ">
                {rupiah(subTotal)}
              </span>
            </div>
            {selectedVoucher === "" ? (
              ""
            ) : selectedVoucher === null || selectedVoucher === 0 ? (
              <div className="flex justify-between">
                <span className="font-semibold text-xl text-maingreen">
                  Voucher
                </span>
                <span className="text-reddanger text-xl font-bold ">
                  gratis ongkir
                </span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="font-semibold text-xl text-maingreen">
                  Voucher
                </span>
                <span className="text-reddanger text-xl font-bold ">
                  {rupiah(selectedVoucher)}
                </span>
              </div>
            )}
            {deliveryFee && (
              <div className="flex justify-between border-b-2 border-x-lightgrey">
                <span className="font-semibold text-xl text-maingreen">
                  Delivery fee
                </span>
                <span className="text-reddanger text-xl font-bold ">
                  {selectedVoucher === null || selectedVoucher === 0 ? (
                    <s>{rupiah(deliveryFee)}</s>
                  ) : (
                    rupiah(deliveryFee)
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between ">
              <span className="font-semibold text-xl text-maingreen">
                Total
              </span>
              <span className="text-reddanger text-xl font-bold ">
                {rupiah(grandTotal)}
              </span>
            </div>
            {orderStatus === "Waiting for payment" && (
              <div>
                <div className="border-t-2 border-x-lightgrey mt-6">
                  please update your payment below to proceed your order
                </div>
                <Formik
                  enableReinitialize
                  initialValues={{ file: null }}
                  validationSchema={paymentSchema}
                  onSubmit={handleSubmit}
                >
                  {(props) => (
                    <Form>
                      <div className="flex flex-col gap-2 py-4 mb-4">
                        <label htmlFor="file" className="">
                          payment proof Image
                          <span className="text-sm font-normal">
                            (.jpg, .jpeg, .png)
                          </span>
                          <span className="text-reddanger font-normal">*</span>
                        </label>
                        <div className="relative">
                          <input
                            className="border border-gray-300 text-xs w-full focus:border-darkgreen focus:ring-0"
                            type="file"
                            id="file"
                            name="file"
                            onChange={(e) => {
                              props.setFieldValue(
                                "file",
                                e.currentTarget.files[0]
                              );
                            }}
                            required
                          />
                          {props.errors.file && props.touched.file && (
                            <div className="text-sm text-reddanger absolute top-12">
                              {" "}
                              {props.errors.file}{" "}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-row">
                        <ModalCancelOrder
                          onSubmit={(e) => handleCancel(e, id)}
                        />
                        <Modal
                          isDisabled={!props.dirty || !props.values.file}
                          modalTitle={"Update payment"}
                          toggleName={"Update payment"}
                          content={
                            "By uploading this image, you're lanjuut. Are you sure?"
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
            )}
            {orderStatus === "Delivering" && (
              <div className="m-2 ">
                <Modal
                  modalTitle={"Confirm order"}
                  toggleName={"Confirm order"}
                  content={"are you sure you want to complete this order?"}
                  buttonCondition={"positive"}
                  buttonLabelOne={"Cancel"}
                  buttonLabelTwo={"Yes"}
                  buttonTypeOne={"button"}
                  buttonTypeTwo={"submit"}
                  onClickButton={handleConfirm}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
