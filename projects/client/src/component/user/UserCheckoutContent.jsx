import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSelectedCartItems } from "../../store/reducer/cartSlice";
import rupiah from "../../helpers/rupiah";
import CustomDropdown from "../CustomDropdown";
import Modal from "../Modal";
import { updateCart } from "../../store/reducer/cartSlice";
import VoucherLists from "./VoucherLists";
import AlertPopUp from "../AlertPopUp";
import { getUserVouchers } from "../../api/promotion";
import { getCart, getShippingCost, userCheckout } from "../../api/transaction";
import { getMainAddress } from "../../api/profile";
import { calculateTotalPrice as calculateSubTotalPrice } from "../../helpers/transaction/calculateTotalPrice";
import { calculateTotalWeight } from "../../helpers/transaction/calculateTotalWeight";
import CheckoutTitle from "./checkoutComponent/CheckoutTitle";
import CheckoutList from "./checkoutComponent/CheckoutList";
import SubTotal from "./checkoutComponent/SubTotal";
import FreeShipping from "./checkoutComponent/FreeShipping";

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
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const token = localStorage.getItem("token");

  const fetchUserVouchers = async () => {
    try {
      const response = await getUserVouchers(token, subTotal);
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
      const response = await getCart(token);
      const selectedCartItems = response.data.data.filter((item) =>
        selectedItems.includes(item.id)
      );
      setCheckoutItems(selectedCartItems);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const fetchUserAddress = async () => {
    try {
      const response = await getMainAddress(token);
      if (response.data.data) {
        setUserAddress(response.data.data);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const calculateTotalPrice = () => {
    if (selectedVoucher.value === "") {
      setGrandTotal(Number(subTotal) + Number(deliveryFee));
    } else {
      if (selectedVoucher.value === 0) {
        setGrandTotal(Number(subTotal));
      } else if (selectedVoucher.value !== 0) {
        setGrandTotal(
          Number(subTotal) + Number(deliveryFee) - Number(selectedVoucher.value)
        );
      }
    }
  };
  const fetchRajaOngkir = async () => {
    try {
      const response = await getShippingCost(
        token,
        origin,
        destination,
        totalWeight,
        courier
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

  const subTotal = calculateSubTotalPrice(checkoutItems, "cart");
  const totalWeight = calculateTotalWeight(checkoutItems);
  useEffect(() => {
    fetchUserAddress();
  }, []);
  useEffect(() => {
    fetchUserVouchers();
  }, [grandTotal, subTotal]);
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
  }, [deliveryFee, selectedVoucher]);

  const courrierList = [
    { label: "--select courier--", value: "" },
    { label: "JNE", value: "jne" },
    { label: "POS Indonesia", value: "pos" },
    { label: "TIKI", value: "tiki" },
  ];

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
      setSelectedVoucher({ id: "", value: "" });
    } else {
      if (value === null) {
        setSelectedVoucher({ id, value: 0 });
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
      if (selectedVoucher.id !== "") {
        requestBody.voucher_id = selectedVoucher.id;
      }
      if (!courier || !deliveryFee) {
        setErrorMessage("please select a courier and shipping method");
        handleShowAlert("open");
      }
      const response = await userCheckout(token, requestBody);
      if (response.status === 200) {
        const orderId = response.data.data.id;
        navigate(`/user/payment/${orderId}`);
        const cart = await getCart(token);
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
  return (
    <div className="sm:py-4 px-2 flex flex-col w-full sm:max-w-7xl mx-auto gap-4 lg:justify-center font-inter">
      {showAlert && (
        <AlertPopUp
          condition={errorMessage && "fail"}
          content={errorMessage && errorMessage}
          setter={() => handleShowAlert(false)}
        />
      )}
      <div className="w-full sm:w-full lg:w-4/6 mx-auto">
        <CheckoutTitle />
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
          <div className="flex gap-4 overflow-x-auto sm:w-full">
            {vouchersList.length !== 0
              ? vouchersList.map((voucher) => (
                  <VoucherLists
                    vouchers={voucher}
                    selectedVoucher={selectedVoucher}
                    handleVoucherClick={handleVoucherClick}
                  />
                ))
              : "no  voucher available"}
          </div>
        </div>
        <div className="text-maingreen font-semibold">My Order Summary</div>
        <CheckoutList checkoutItems={checkoutItems} />
        <SubTotal subTotal={subTotal} />
        {selectedVoucher.id === "" ? (
          ""
        ) : selectedVoucher.value === 0 ? (
          <FreeShipping />
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
