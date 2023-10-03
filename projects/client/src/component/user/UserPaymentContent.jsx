import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import rupiah from "../../helpers/rupiah";
import Modal from "../../component/Modal";
import AlertPopUp from "../../component/AlertPopUp";
import { cancelOrderUser, getUserOrders, userConfirmOrder, userPayment } from "../../api/transaction";
import { calculateTotalPrice as calculateSubTotalPrice } from "../../helpers/transaction/calculateTotalPrice";
import PaymentForm from "./paymentComponent/UserPaymentForm";
import PaymentTitle from "./paymentComponent/PaymentTitle";
import OrderStatusPayment from "./paymentComponent/OrderStatusPayment";
import OrderList from "./paymentComponent/OrderList";
import FreeShipping from "./checkoutComponent/FreeShipping";
import TimeRemaining from "./paymentComponent/TimeRemaining";
import SubTotal from "./checkoutComponent/SubTotal";
import GrandTotal from "./checkoutComponent/GrandTotal";
import CanceledDetails from "./paymentComponent/CanceledDetails";

export default function UserPaymentContent() {
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
      const response = await getUserOrders(token, id);
      if (response.data?.data?.voucher_id) {
        setSelectedVoucher(response.data?.data?.Voucher?.maxDiscount);
      }
      setDeliveryFee(response.data.data.shippingCost);
      setOrderStatus(response.data.data.orderStatus);
      setOrderData(response.data);
      setGrandTotal(response.data.data.totalPrice);

      console.log(response?.data?.data);
    } catch (error) {
      console.log(error.message);
    }
  };
  const handleCancel = async (body, id) => {
    try {
      const response = await cancelOrderUser(token, body, id);
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
  const handleSubmit = async (values, { setSubmitting, resetForm, setStatus }) => {
    const { file } = values;
    const formData = new FormData();
    formData.append("file", file);
    console.log("test");
    try {
      const response = await userPayment(token, formData, id);
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
      const response = await userConfirmOrder(token, id);
      if (response.status === 200) {
        navigate("/user/orders");
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [orderStatus]);
  useEffect(() => {
    if (orderData && orderData.data && orderData.data.orderDate) {
      const createdAtTimestamp = Date.parse(new Date(orderData.data.orderDate));
      const currentTime = Date.now();
      const timeElapsed = Math.floor((currentTime - createdAtTimestamp) / 1000);
      const initialTimeRemaining = Math.max(30 * 60 - timeElapsed, 0);

      setTimer(initialTimeRemaining);

      const countdown = () => {
        if (timer > 0) {
          setTimer(timer - 1);
          setTimeout(countdown, 1000);
        } else {
          if (orderStatus === "Waiting for payment") {
            handleCancel({ cancelReason: "time has run out" }, id);
          }
        }
      };

      const countdownTimeout = setTimeout(countdown, 1000);
      return () => {
        clearTimeout(countdownTimeout);
      };
    }
  }, [timer, orderData]);
  useEffect(() => {
    if (orderData?.data?.Branch_Products) {
      const calculatedSubTotal = calculateSubTotalPrice(
        orderData?.data?.Branch_Products,
        "payment"
      );
      setSubTotal(calculatedSubTotal);
    }
  }, [orderData]);
  return (
    <div>
      {orderData ? (
        <div className="flex flex-col justify-center items-center">
          {showAlert ? (
            <AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert} />
          ) : null}
          <div className="w-full lg:w-4/6">
            <div className="flex sticky top-0 z-10 sm:static bg-white py-3 lg:pt-10">
              <PaymentTitle orderData={orderData} />
            </div>
            <div className="mx-4">
              {orderStatus === "Waiting for payment" && (<TimeRemaining timer={timer} />)}
              <OrderStatusPayment orderStatus={orderStatus} />
              <CanceledDetails orderStatus={orderStatus} orderData={orderData} />
              <OrderList orderData={orderData} />
              <SubTotal subTotal={subTotal} />
              {selectedVoucher === "" ? ("") : selectedVoucher === null || selectedVoucher === 0 ? (<FreeShipping />) : (
                <div className="flex justify-between">
                  <span className="font-semibold text-xl text-maingreen">Voucher</span>
                  <span className="text-reddanger text-xl font-bold ">{rupiah(selectedVoucher)}</span>
                </div>
              )}
              {deliveryFee && (
                <div className="flex justify-between border-b-2 border-x-lightgrey">
                  <span className="font-semibold text-xl text-maingreen">Delivery fee</span>
                  <span className="text-reddanger text-xl font-bold ">{selectedVoucher === null || selectedVoucher === 0 ? (<s>{rupiah(deliveryFee)}</s>) : (rupiah(deliveryFee))}</span>
                </div>
              )}
              <GrandTotal grandTotal={grandTotal} />
              {orderStatus === "Waiting for payment" && (
                <div>
                  <div className="border-t-2 border-x-lightgrey mt-6 pt-2 font-semibold text-base">Please update your payment below to proceed your order</div>
                  <PaymentForm handleSubmit={handleSubmit} id={id} handleCancel={handleCancel} />
                </div>
              )}
              {orderStatus === "Delivering" && (<div className="m-2 "><Modal modalTitle={"Confirm order"} toggleName={"Confirm order"} content={"are you sure you want to complete this order?"} buttonCondition={"positive"} buttonLabelOne={"Cancel"} buttonLabelTwo={"Yes"} buttonTypeOne={"button"} buttonTypeTwo={"submit"} onClickButton={handleConfirm} /></div>)}
            </div>
          </div>
        </div>
      ) : (<p>Loading...</p>)}
    </div>
  );
}