import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BsTrash } from "react-icons/bs";
import NavbarTop from "../../component/NavbarTop";
import NavbarBottom from "../../component/NavbarBottom";
import CartItem from "../../component/user/CartItem";
import cartImg from "../../assets/cart.png";
import { useNavigate } from "react-router-dom";
import Button from "../../component/Button";
import rupiah from "../../helpers/rupiah";
import AlertPopUp from "../../component/AlertPopUp";
import { updateCart } from "../../store/reducer/cartSlice";
import Modal from "../../component/Modal";
import { setSelectedCartItems } from "../../store/reducer/cartSlice";

export default function Cart() {
  

  const [totalPrice, setTotalPrice] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.cart);
  const selectedItems = useSelector((state) => state.cart.selectedCartItems);

  const calculateTotalPrice = (selectedCartItems) => {
    let total = 0;

    if (selectedCartItems.length > 0) {
      // Calculate only if items are selected
      for (const item of selectedCartItems) {
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

    setTotalPrice(total);
  };

  useEffect(() => {
    // Filter cart items based on selectedItems
    const selectedCartItems = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );

    calculateTotalPrice(cartItems);
  }, [cartItems, selectedItems]);

  // Function to handle item selection
  const handleItemSelect = (cartId) => {
    // Create a new array with the updated selected items
    const updatedSelectedItems = [...selectedItems];
    if (updatedSelectedItems.includes(cartId)) {
      // If already selected, remove it
      const index = updatedSelectedItems.indexOf(cartId);
      updatedSelectedItems.splice(index, 1);
    } else {
      // If not selected, add it
      updatedSelectedItems.push(cartId);
    }

    // Dispatch the action to update selectedItems in the Redux store
    dispatch(setSelectedCartItems(updatedSelectedItems));
  };
  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/users/carts`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { cartList: selectedItems },
      });
      const cartResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/carts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

  // Use useEffect to re-render totalPrice every time it changes
  useEffect(() => {
    // Filter cart items based on selectedItems
    const selectedCartItems = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );

    // Calculate total price only if there are selected items
    calculateTotalPrice(selectedCartItems);
  }, [cartItems, selectedItems]);
  console.log(selectedItems, "ini");

  const handleHideAlert = () => {
    setShowAlert(false);
  };

  return (
    <div>
      <NavbarTop />
      <div>
        <div className="text-3xl lg:text-5xl font-bold text-maingreen py-4 text-center">
          Cart
        </div>
        {showAlert ? (
          <AlertPopUp
            condition={errorMessage ? "fail" : "success"}
            content={errorMessage ? errorMessage : successMessage}
            setter={handleHideAlert}
          />
        ) : null}
        <div className="flex justify-end mx-6 lg:px-20">
          {selectedItems.length === 0 ? (
            <div className="flex justify-end mx-6 lg:px-20 text-white">_</div>
          ) : selectedItems.length > 0 ? (
            <Modal
              modalTitle="Delete Cart"
              buttonCondition="trash"
              content="are you sure you want to remove this from your cart?"
              buttonLabelOne="Cancel"
              buttonLabelTwo="Yes"
              onClickButton={handleDelete}
            />
          ) : (
            <button disabled>
              <BsTrash size={25} color="grey" />
            </button>
          )}
        </div>
      </div>
      <div>
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center">
            <img src={cartImg} alt="Empty Cart" />
            <span className="font-bold text-3xl p-2">
              Oops! It looks like your cart is empty. Time to fill it up with
              your favorite items!
            </span>
            <div className="w-60 p-2">
              <Button
                label="Shop Now"
                condition="positive"
                onClick={() => navigate("/")}
              />
            </div>
          </div>
        ) : (
          <div>
            {cartItems.map((data) => (
              <CartItem
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
                onSelect={handleItemSelect} // Pass the onSelect function to CartItem
                selected={selectedItems.includes(data.id)} // Check if item is selected
              />
            ))}
            <div className=" flex flex-row  lg:justify-end lg:mx-16 sm:justify-between">
              <span className="font-semibold text-xl text-maingreen mx-10 ">
                Total
              </span>
              <span className="text-reddanger text-xl font-bold ">
                {rupiah(totalPrice)}
              </span>
            </div>
            <div className="flex sm:justify-center lg:justify-end mx-16 mt-2">
              <div className="w-72">
                <Button
                  label="Checkout"
                  condition="positive"
                  onClick={() => {
                    navigate("/user/checkout");
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <NavbarBottom />
    </div>
  );
}
