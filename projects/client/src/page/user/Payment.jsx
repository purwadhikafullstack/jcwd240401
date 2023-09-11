import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import rupiah from "../../helpers/rupiah";
import Button from "../../component/Button";
import Modal from "../../component/Modal";

export default function Payment() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [orderData, setOrderData] = useState(null);
  const [countdown, setCountdown] = useState(1800);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/order/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrderData(response.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

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
          <div className="text-3xl lg:text-5xl font-bold text-maingreen py-4 text-center">
            Payment
          </div>
          <div className="text-reddanger text-xl font-bold ">
            Time remaining: {Math.floor(countdown / 60)}:{countdown % 60}
          </div>
          <div className="flex flex-row">
            <span>Invoice Code: {orderData.data.invoiceCode}</span>
            <span>Order Status: {orderData.data.orderStatus}</span>
          </div>
          <p>Total Price: {orderData.data.totalPrice}</p>
          {/* Display price for each order item */}
          <h3>Order Items</h3>
          <div className="flex flex-col">
            {orderData.data.Branch_Products.map((product) => (
              <div key={product.id}>
                {product.Product.name} qty: {product.Order_Item.quantity}
                {rupiah(product.Order_Item.price)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <div className="flex flex-row">
        <Modal
          modalTitle={"Cancel"}
          toggleName={"Cancel"}
          content={"Are you sure you want to cancel this order?"}
          buttonLabelOne={"Cancel"}
          buttonCondition={"negative"}
          buttonLabelTwo={"Yes"}
        />
        <Modal
          modalTitle={"Checkout"}
          toggleName={"Checkout"}
          content={"Are you sure you want to checkout?"}
          buttonLabelOne={"Cancel"}
          buttonCondition={"positive"}
          buttonLabelTwo={"Yes"}
        />
      </div>
    </div>
  );
}
