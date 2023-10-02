import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BsTrash } from "react-icons/bs";
import CartItem from "../../component/user/CartItem";
import { useNavigate } from "react-router-dom";
import Button from "../../component/Button";
import rupiah from "../../helpers/rupiah";
import AlertPopUp from "../../component/AlertPopUp";
import { updateCart } from "../../store/reducer/cartSlice";
import Modal from "../../component/Modal";
import { setSelectedCartItems } from "../../store/reducer/cartSlice";
import UnavailableCartItem from "./UnavailableCartItem";
import UnauthenticatedContent from "./UnauthenticatedContent";
import { calculateTotalPrice } from "../../helpers/transaction/calculateTotalPrice";
import {
  getCart,
  getUnavailableCart,
  handleDeleteCart,
} from "../../api/transaction";
import EmptyCart from "./cartComponent/EmptyCart";
import UnavailableCartTitle from "./cartComponent/UnavailableCartTitle";

export default function UserCartContent() {
  const [totalPrice, setTotalPrice] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [unavailableCart, setUnavailableCart] = useState([]);
  const [hasFetchedUnavailableCart, setHasFetchedUnavailableCart] =
    useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.cart);
  const selectedItems = useSelector((state) => state.cart.selectedCartItems);
  const profile = useSelector((state) => state.auth.profile);

  const fetchUnavailableCart = async () => {
    try {
      const response = await getUnavailableCart(token);
      if (response.data.data) {
        setUnavailableCart(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const totalPriceCalculation = (selectedCartItems) => {
    const total = calculateTotalPrice(selectedCartItems, "cart");
    setTotalPrice(total);
  };

  useEffect(() => {
    if (selectedItems.length > 0) {
      const selectedCartItems = cartItems.filter((item) =>
        selectedItems.includes(item.id)
      );
      totalPriceCalculation(selectedCartItems);
    } else {
      setTotalPrice(0);
    }
  }, [cartItems, selectedItems]);

  const handleItemSelect = (cartId) => {
    const updatedSelectedItems = [...selectedItems];
    if (updatedSelectedItems.includes(cartId)) {
      const index = updatedSelectedItems.indexOf(cartId);
      updatedSelectedItems.splice(index, 1);
    } else {
      updatedSelectedItems.push(cartId);
    }
    dispatch(setSelectedCartItems(updatedSelectedItems));
    localStorage.setItem(
      "selectedCartItems",
      JSON.stringify(updatedSelectedItems)
    );
  };
  const handleDelete = async () => {
    try {
      await handleDeleteCart(token, selectedItems);
      const cartResponse = await getCart(token);

      dispatch(updateCart(cartResponse.data.data));
      dispatch(setSelectedCartItems([]));

      if (cartResponse.status == 200) {
        setErrorMessage("");
        setSuccessMessage(cartResponse.data?.message);
        setShowAlert(true);
      }
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage("");
      setShowAlert(true);
    }
  };

  useEffect(() => {
    const selectedCartItems = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );
    calculateTotalPrice(selectedCartItems, "cart");
  }, [cartItems, selectedItems]);

  useEffect(() => {
    fetchUnavailableCart();
  }, [hasFetchedUnavailableCart]);

  const handleHideAlert = () => {
    setShowAlert(false);
  };

  return (
    <div className="py-2 sm:py-4 px-2 flex flex-col w-full sm:max-w-6xl mx-auto gap-4 lg:justify-center font-inter">
      {token && profile.role === "3" ? (
        <>
          <div>
            <div className="text-3xl lg:text-5xl font-bold text-maingreen py-4 text-center">Cart</div>
            {showAlert ? (
              <AlertPopUp condition={errorMessage ? "fail" : "success"} content={errorMessage ? errorMessage : successMessage} setter={handleHideAlert} />
            ) : null}
            <div className="flex justify-end mx-6 lg:px-20">
              {selectedItems.length === 0 ? (
                <div className="flex justify-end mx-6 lg:px-20 text-white">_</div>
              ) : selectedItems.length > 0 ? (
                <Modal modalTitle="Delete Cart" buttonCondition="trash" content="Are you sure you want to remove this from your cart?" buttonLabelOne="Cancel" buttonLabelTwo="Yes" onClickButton={handleDelete} />
              ) : (
                <button disabled><BsTrash size={25} color="grey" /></button>
              )}
            </div>
          </div>
          <div>
            {cartItems.length !== 0 && (
              <div>
                {cartItems.map((data) => (
                  <CartItem data={data} onSelect={handleItemSelect} selected={selectedItems.includes(data.id)} />
                ))}
                <div className=" flex flex-row  lg:justify-end lg:mx-16 sm:justify-between">
                  <span className="font-semibold text-xl text-maingreen mx-10 ">Total</span>
                  <span className="text-reddanger text-xl font-bold ">{rupiah(totalPrice)}</span>
                </div>
                <div className="flex sm:justify-center lg:justify-end mx-16 mt-2">
                  <div className="w-72">
                    <Button
                      label="Checkout"
                      condition="positive"
                      isDisabled={selectedItems.length === 0}
                      onClick={() => {
                        navigate("/user/checkout");
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            {unavailableCart.length > 0 && (
              <>
                <UnavailableCartTitle unavailableCart={unavailableCart} />
                {unavailableCart.map((data) => (
                  <UnavailableCartItem
                    key={data.id} quantity={data.quantity}
                    name={data.Branch_Product.Product.name}
                    weight={data.Branch_Product.Product.weight}
                    UOM={data.Branch_Product.Product.unitOfMeasurement}
                    productImg={data.Branch_Product.Product.imgProduct}
                    discountId={data.Branch_Product.discount_id}
                    discountType={
                      data.Branch_Product.Discount?.discount_type_id
                    }
                    isExpired={data.Branch_Product.Discount?.isExpired}
                    basePrice={data.Branch_Product.Product.basePrice}
                    discountAmount={data.Branch_Product.Discount?.amount}
                    productStock={data.Branch_Product.quantity}
                    cartId={data.id}
                    setterDelete={setHasFetchedUnavailableCart}
                    stateDelete={hasFetchedUnavailableCart}
                  />
                ))}
              </>
            )}

            {cartItems.length === 0 && unavailableCart.length === 0 && (
              <EmptyCart />
            )}
          </div>
        </>
      ) : (
        <UnauthenticatedContent />
      )}
    </div>
  );
}
