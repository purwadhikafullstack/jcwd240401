import { createSlice } from "@reduxjs/toolkit";

export const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [],
    selectedCartItems: [], 
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
    clearSelectedCartItems: (state) => {
      state.selectedCartItems = [];
    },
  },
});

export const {
  updateCart,
  clearCart,
  setSelectedCartItems,
  clearSelectedCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;
