import { createSlice } from "@reduxjs/toolkit";

export const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [],
    selectedCartItems: [], // Add selectedCartItems to the initial state
  },
  reducers: {
    updateCart: (state, action) => {
      state.cart = action.payload;
    },
    clearCart: (state) => {
      state.cart = [];
    },
    setSelectedCartItems: (state, action) => {
      state.selectedCartItems = action.payload;
    },
  },
});

export const { updateCart, clearCart, setSelectedCartItems } =
  cartSlice.actions;

export default cartSlice.reducer;
