import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import rupiah from "../../helpers/rupiah";
import Modal from "../../component/Modal";
import CheckoutItem from "../../component/user/CheckoutItem";
import ModalCancelOrder from "../../component/ModalCancelOrder";

export default function Payment() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [orderData, setOrderData] = useState(null);
  const [countdown, setCountdown] = useState(1800);
  const [subTotal, setSubTotal] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [grandTotal, setGrandTotal] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const navigate = useNavigate();

  const fetchOrder = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/order/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedVoucher(response.data.data.Voucher.maxDiscount);
      setDeliveryFee(response.data.data.shippingCost);
      setOrderStatus(response.data.data.orderStatus);
      setOrderData(response.data);
      setGrandTotal(response.data.data.totalPrice);
      const calculatedSubTotal = calculateSubTotalPrice(
        response.data?.data?.Branch_Products
      );
      setSubTotal(calculatedSubTotal);
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
  console.log(subTotal);
  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, []);

  // Update the countdown timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      } else {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  return (
    <div>
      {orderData ? (
        <div className="flex flex-col justify-center items-center">
          <div className="w-full lg:w-4/6">
            <div className="text-3xl lg:text-5xl font-bold text-maingreen py-4 text-center">
              Invoice
            </div>
            <div className="text-xl lg:text-2xl font-semibold text-reddanger text-center pb-2">
              {orderData.data.invoiceCode}
            </div>
            {orderStatus === "Waiting for payment" && (
              <div className="text-reddanger text-xl font-bold ">
                Time remaining: {Math.floor(countdown / 60)}:{countdown % 60}
              </div>
            )}
            <div className="flex flex-row">
              <span className="text-maingreen font-semibold">
                Order Status:
              </span>
              <span className="mx-2">{orderStatus}</span>
            </div>

            <div className="text-maingreen font-semibold">My Order Summary</div>
            {orderData.data.Branch_Products.map((product) => (
              <CheckoutItem
                key={product.id}
                quantity={product.Order_Item?.quantity}
                name={product.Product.name}
                weight={product.Product.weight}
                UOM={product.Product.unitOfMeasurement}
                productImg={product.Product.imgProduct}
                discountId={product.Discount.id}
                discountType={product.Discount.discount_type_id}
                isExpired={product.Discount.isExpired}
                basePrice={product.Product.basePrice}
                discountAmount={product.Discount.amount}
                productStock={product.quantity}
                cartId={product.id}
                productId={product.id}
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
            ) : selectedVoucher === 0 ? (
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
                  {selectedVoucher === 0 ? (
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
              <div className="flex flex-row">
                <ModalCancelOrder onSubmit={(e) => handleCancel(e, id)} />
                <Modal
                  modalTitle={"Checkout"}
                  toggleName={"Checkout"}
                  content={"Are you sure you want to checkout?"}
                  buttonLabelOne={"Cancel"}
                  buttonCondition={"positive"}
                  buttonLabelTwo={"Yes"}
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
