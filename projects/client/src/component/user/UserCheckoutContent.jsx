import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSelectedCartItems } from "../../store/reducer/cartSlice";
import CheckoutItem from "./CheckoutItem";
import rupiah from "../../helpers/rupiah";
import CustomDropdown from "../CustomDropdown";
import Modal from "../Modal";
import { updateCart } from "../../store/reducer/cartSlice";
import VoucherList from "./voucherList";
import AlertPopUp from "../AlertPopUp";

export default function UserCheckoutContent() {
  const selectedItems = useSelector((state) => state.cart.selectedCartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [userAddress, setUserAddress] = useState("");
  const [courier, setCourier] = useState("");
  const [shipping, setShipping] = useState([]);
  const [deliveryFee, setDeliveryFee] = useState("");
  const [grandTotal, setGrandTotal] = useState("");
  const [vouchersList, setVouchersList] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState({ id: "", value: "" });
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const token = localStorage.getItem("token");

  const fetchUserVouchers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/vouchers/${grandTotal}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.data.length === 0) {
        setVouchersList(response.data.data);
      } else {
        const data = response?.data?.data;
        if (data) {
          setVouchersList(data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

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
  const calculateTotalPrice = () => {
    if (selectedVoucher.value === "") {
      setGrandTotal(Number(subTotal) + Number(deliveryFee));
      console.log("gaada voucher");
    } else {
      if (selectedVoucher.value === 0) {
        setGrandTotal(Number(subTotal));
        console.log("gratis ongkir");
      } else if (selectedVoucher.value !== 0) {
        setGrandTotal(
          Number(subTotal) + Number(deliveryFee) - Number(selectedVoucher.value)
        );
        console.log("pake voucher");
      }
    }
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
  useEffect(() => {
    fetchUserVouchers();
  }, [grandTotal]);
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

  useEffect(() => {
    calculateTotalPrice();
    console.log(subTotal, deliveryFee, selectedVoucher, "ini ngitung");
  }, [deliveryFee, selectedVoucher]);

  const courrierList = [
    { label: "--select courier--", value: "" },
    { label: "JNE", value: "jne" },
    { label: "POS Indonesia", value: "pos" },
    { label: "TIKI", value: "tiki" },
  ];
  console.log(grandTotal, "ini total ");

  const handleChangeDropdown = (obj, action) => {
    if (action === "courier") {
      if (!obj.value) {
        setCourier("");
        setShipping([]);
        setDeliveryFee("");
        setGrandTotal("");
      }
      setCourier(obj.value);
    }
    if (action === "fee") {
      if (obj.value) {
        setDeliveryFee(obj.value);
      }
    }
  };
  const handleVoucherClick = (id, value) => {
    if (selectedVoucher.id === id) {
      // If the clicked voucher is already selected, deselect it
      setSelectedVoucher({ id: "", value: "" });
    } else {
      if (value === null) {
        setSelectedVoucher({ id: "", value: "" });
      } else {
        setSelectedVoucher({ id, value });
      }
    }
  };
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

  const handleCheckout = async () => {
    const cart = localStorage.getItem("selectedCartItems");

    try {
      let requestBody = {
        shippingMethod: courier,
        shippingCost: deliveryFee,
        totalPrice: grandTotal,
        cartItems: cart,
      };

      // Check if a voucher is selected
      if (selectedVoucher.id !== "") {
        requestBody.voucher_id = selectedVoucher.id;
      }

      if (!courier || !deliveryFee) {
        setErrorMessage("please select a courier and shipping method");
        handleShowAlert("open");
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/users/checkout`,
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        const orderId = response.data.data.id;
        navigate(`/user/payment/${orderId}`);
        const cart = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/users/carts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        dispatch(updateCart(cart.data.data));
        dispatch(setSelectedCartItems([]));
        localStorage.removeItem("selectedCartItems");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const destination = userAddress?.city_id;
  const origin = checkoutItems[0]?.Branch_Product?.Branch?.city_id;
  console.log(selectedVoucher, "ini selected");
  return (
    <div className="flex flex-col items-center">
      {showAlert && (
        <AlertPopUp
          condition={errorMessage && "fail"}
          content={errorMessage && errorMessage}
          setter={() => handleShowAlert(false)}
        />
      )}
      <div className="sm:w-full lg:w-4/6">
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
            onChange={(e) => handleChangeDropdown(e, "courier")}
            placeholder={"--select courier--"}
          />
          {shipping.length !== 0 && (
            <div>
              <label htmlFor="name" className="flex flex-col">
                Shipping method
              </label>
              <CustomDropdown
                options={shipping}
                onChange={(e) => handleChangeDropdown(e, "fee")}
                placeholder={"--select shipping--"}
              />
            </div>
          )}
          <label htmlFor="name" className="">
            Voucher
          </label>
          <div className="flex flex-col gap-4">
            {vouchersList.map((voucher) => (
              <VoucherList
                vouchers={voucher}
                selectedVoucher={selectedVoucher}
                handleVoucherClick={handleVoucherClick}
              />
            ))}
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
          <span className="font-semibold text-xl text-maingreen">
            Sub total
          </span>
          <span className="text-reddanger text-xl font-bold ">
            {rupiah(subTotal)}
          </span>
        </div>
        {selectedVoucher.id === "" ? (
          ""
        ) : selectedVoucher.value === 0 ? (
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
              {rupiah(selectedVoucher.value)}
            </span>
          </div>
        )}
        {deliveryFee && (
          <div className="flex justify-between border-b-2 border-x-lightgrey">
            <span className="font-semibold text-xl text-maingreen">
              Delivery fee
            </span>
            <span className="text-reddanger text-xl font-bold ">
              {selectedVoucher.value === 0 ? (
                <s>{rupiah(deliveryFee)}</s>
              ) : (
                rupiah(deliveryFee)
              )}
            </span>
          </div>
        )}
        <div className="flex justify-between ">
          <span className="font-semibold text-xl text-maingreen">Total</span>
          <span className="text-reddanger text-xl font-bold ">
            {rupiah(grandTotal)}
          </span>
        </div>
        <div className="mb-14 my-4 sm:mx-10 lg:mx-64">
          <Modal
            onClickButton={handleCheckout}
            modalTitle={"Checkout"}
            toggleName={"Checkout"}
            content={"Are you sure you want to checkout?"}
            buttonLabelOne={"Cancel"}
            buttonCondition={"positive"}
            buttonLabelTwo={"Yes"}
            isDisabled={!deliveryFee}
          />
        </div>
      </div>
    </div>
  );
}
