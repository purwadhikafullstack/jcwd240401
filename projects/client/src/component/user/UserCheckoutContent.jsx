import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { Field, Formik } from "formik";
import * as yup from "yup";
import { setSelectedCartItems } from "../../store/reducer/cartSlice";
import CheckoutItem from "./CheckoutItem";
import InputField from "../InputField";
import rupiah from "../../helpers/rupiah";
import CustomDropdown from "../CustomDropdown";

export default function UserCheckoutContent() {
  const selectedItems = useSelector((state) => state.cart.selectedCartItems);
  const dispatch = useDispatch();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [userAddress, setUserAddress] = useState("");
  const [courier, setCourier] = useState("");
  const [shipping, setShipping] = useState({});
  const token = localStorage.getItem("token");

  const fetchCartItems = async () => {
    try {
      // Make a GET request to retrieve all cart items
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/carts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Filter the response data to include only the selected cart items
      const selectedCartItems = response.data.data.filter((item) =>
        selectedItems.includes(item.id)
      );

      // Update the state with the selected cart items' details
      setCheckoutItems(selectedCartItems);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const fetchUserAddress = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/main-address`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response.data.data, "ini alamat");
      if (response.data.data) {
        setUserAddress(response.data.data);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const calculateSubTotalPrice = (responseData) => {
    let total = 0;

    if (responseData.length > 0) {
      // Calculate only if items are selected
      for (const item of responseData) {
        const basePrice = item.Branch_Product.Product.basePrice;
        const quantity = item.quantity;
        const discount = item.Branch_Product?.Discount;
        const expired = item.Branch_Product?.Discount?.isExpired;

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
  const calculateTotalWeight = (responseData) => {
    let total = 0;
    if (responseData.length > 0) {
      for (const item of responseData) {
        const itemWeight = item.Branch_Product?.Product?.weight;
        const itemQuantity = item.quantity;
        total += itemWeight * itemQuantity;
      }
    }
    return total;
  };

  const fetchRajaOngkir = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/users/shipping-cost`,
        {
          origin: origin,
          destination: destination,
          weight: totalWeight,
          courier: courier,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response?.data?.data?.results[0]?.costs) {
        let data = response?.data?.data?.results[0]?.costs;
        if (data) {
          let option = data?.map((d) => ({
            label: `${d.service} - ${rupiah(d.cost[0]?.value)}  [${
              d.cost[0]?.etd
            } hari] `,
            value: d.cost[0].value,
          }));
          setShipping(option);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const subTotal = calculateSubTotalPrice(checkoutItems);
  const totalWeight = calculateTotalWeight(checkoutItems);
  useEffect(() => {
    fetchUserAddress();
  }, []);
  console.log(shipping, "ini shipping");
  useEffect(() => {
    fetchCartItems();
  }, [selectedItems]);
  useEffect(() => {
    const savedSelectedItems = localStorage.getItem("selectedCartItems");
    if (savedSelectedItems) {
      dispatch(setSelectedCartItems(JSON.parse(savedSelectedItems)));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchRajaOngkir();
  }, [courier]);

  const courrierList = [
    { label: "--select courier--", value: "" },
    { label: "JNE", value: "jne" },
    { label: "POS Indonesia", value: "pos" },
    { label: "TIKI", value: "tiki" },
  ];

  const handleChangeDropdown = (obj) => {
    setCourier(obj.value);
  };
  console.log(shipping);
  const destination = userAddress?.city_id;
  const origin = checkoutItems[0]?.Branch_Product?.Branch?.city_id;
  return (
    <div>
      <div className="text-3xl lg:text-5xl font-bold text-maingreen py-4 text-center">
        Checkout
      </div>
      <div className="text-maingreen font-semibold">My Selected Address</div>
      <div>{`${userAddress?.streetName}, ${userAddress?.City?.city_name}`}</div>

      <div className="flex flex-col gap-2 py-4 font-inter mb-4">
        <label htmlFor="name" className="">
          Courier
        </label>
        <CustomDropdown
          options={courrierList}
          onChange={handleChangeDropdown}
          placeholder={"--select courier--"}
        />
        <label htmlFor="name" className="">
          Shipping method
        </label>
        <CustomDropdown
          options={shipping}
          onChange={handleChangeDropdown}
          placeholder={"--select shipping--"}
        />
        <label htmlFor="name" className="">
          Voucher
        </label>
        <div className="relative">
          <InputField id={"name"} type={"string"} name="name" />
        </div>
      </div>
      <div className="text-maingreen font-semibold">My Order Summary</div>
      {checkoutItems.map((data) => (
        <CheckoutItem
          key={data.id}
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
          productStock={data.Branch_Product.quantity}
          cartId={data.id}
          productId={data.Branch_Product.id}
        />
      ))}
      <div className="flex justify-between">
        <span className="font-semibold text-xl text-maingreen">Sub total</span>
        <span className="text-reddanger text-xl font-bold ">
          {rupiah(subTotal)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold text-xl text-maingreen">Voucher</span>
        <span className="text-reddanger text-xl font-bold ">
          {rupiah(subTotal)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold text-xl text-maingreen">
          Delivery fee
        </span>
        <span className="text-reddanger text-xl font-bold ">
          {rupiah(subTotal)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold text-xl text-maingreen">Total</span>
        <span className="text-reddanger text-xl font-bold ">
          {rupiah(subTotal)}
        </span>
      </div>
    </div>
  );
}
