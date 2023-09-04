import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import NavbarTop from "../../component/NavbarTop";
import NavbarBottom from "../../component/NavbarBottom";
import { setSelectedCartItems } from "../../store/reducer/cartSlice";

export default function Checkout() {
  const selectedItems = useSelector((state) => state.cart.selectedCartItems);
  const [checkoutItems, setCheckoutItems] = useState([]);
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

  useEffect(() => {
    fetchCartItems();
  }, [selectedItems]);

  console.log(checkoutItems, "ini");
  return (
    <div>
      <NavbarTop />
      <div>konten</div>
      <NavbarBottom />
    </div>
  );
}
