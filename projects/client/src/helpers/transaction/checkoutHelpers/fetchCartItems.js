import { getCart } from "../../../api/transaction";

export const fetchCartItems = async (token, selectedItems, setCheckoutItems) => {
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
