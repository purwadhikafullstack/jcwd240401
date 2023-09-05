import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { Field, Formik } from "formik";
import * as yup from "yup";
import { setSelectedCartItems } from "../../store/reducer/cartSlice";
import CheckoutItem from "./CheckoutItem";
import InputField from "../InputField";
import rupiah from "../../helpers/rupiah";

export default function UserCheckoutContent() {
  const selectedItems = useSelector((state) => state.cart.selectedCartItems);
  const dispatch = useDispatch();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [userAddress, setUserAddress] = useState("");
  const [branchAddress, setBranchAddress] = useState("")
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

  const cityFormatter = (address) => {
    const response = address.City.city_name;
    const parts = response.split(" ");
    const city = parts.slice(1).join(" ");
    return city;
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

  const subTotal = calculateSubTotalPrice(checkoutItems);
  useEffect(() => {
    fetchUserAddress();
  }, []);

  useEffect(() => {
    fetchCartItems();
  }, [selectedItems]);
  useEffect(() => {
    const savedSelectedItems = localStorage.getItem("selectedCartItems");
    if (savedSelectedItems) {
      dispatch(setSelectedCartItems(JSON.parse(savedSelectedItems)));
    }
  }, [dispatch]);

  const shippingSchema = yup.object().shape({});
  const handleCheckout = () => {};
  const courrierList = [
    { label: "JNE", value: "JNE" },
    { label: "POS Indonesia", value: "POS Indonesia" },
    { label: "TIKI", value: "TIKI" },
  ];

  const destination = cityFormatter(userAddress);

  return (
    <div>
      <div className="text-3xl lg:text-5xl font-bold text-maingreen py-4 text-center">
        Checkout
      </div>
      <div className="text-maingreen font-semibold">My Selected Address</div>
      <div>{`${userAddress?.streetName}, ${userAddress?.City?.city_name}`}</div>
      <Formik
        initialValues={{
          origin: "",
          destination: destination,
          weight: "",
          courrier: "",
          voucher: "",
        }}
        validationSchema={shippingSchema}
        onSubmit={handleCheckout}
      >
        {(props) => (
          <div className="flex flex-col gap-2 py-4 font-inter mb-4">
            <label htmlFor="courrier" className="">
              Courrier
            </label>
            <Field
              as="select"
              className="w-full mt-1 bg-gray-100 rounded-md border border-gray-300 focus:border-maindarkgreen focus:ring-0"
              name="courrier"
            >
              <option key="empty" value="">
                --choose a courrier--
              </option>
              {courrierList.map((data) => (
                <option key={data.value} value={data.value}>
                  {data.label}
                </option>
              ))}
            </Field>
          </div>
        )}
      </Formik>
      <div className="flex flex-col gap-2 py-4 font-inter mb-4">
        <label htmlFor="name" className="">
          Shipping method
        </label>
        <div className="relative">
          <InputField id={"name"} type={"string"} name="name" />
        </div>
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
