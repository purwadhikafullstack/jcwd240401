import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import NavbarTop from "../../component/NavbarTop";
import NavbarBottom from "../../component/NavbarBottom";
import CartItem from "../../component/user/CartItem";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const token = localStorage.getItem("token");
  const getAllCart = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/carts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data) {
        const data = response.data.data;
        if (data) {
          setCart(data);
          console.log(data);
        } else {
          setCart([]);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  };



  useEffect(() => {
    getAllCart();
  }, []);
  return (
    <div>
      <NavbarTop />
      <div>
        <div className="text-3xl lg:text-5xl font-bold text-maingreen py-4 text-center">
          Cart
        </div>
      </div>
      <div>
        {cart.map((data) => (
          <CartItem
            quantity={data.quantity}
            name={data.Branch_Product.Product.name}
            weight={data.Branch_Product.Product.weight}
            UOM={data.Branch_Product.Product.unitOfMeasurement}
            productImg={data.Branch_Product.Product.imgProduct}
            discountId={data.Branch_Product.discount_id}
            discountType={data.Branch_Product.Discount?.discount_type_id}
            isExpired={data.Branch_Product.Discount?.isExpired}
            basePrice={data.Branch_Product.Product.basePrice}
            discountAmount={data.Branch_Product.Discount?.amount}
          />
        ))}
      </div>
      <NavbarBottom />
    </div>
  );
}
