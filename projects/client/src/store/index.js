import { configureStore } from "@reduxjs/toolkit";
import auth from "./reducer/authSlice";
import cart from "./reducer/cartSlice";
import location from "./reducer/locationSlice";

export const store = configureStore({
  reducer: { auth, cart, location },
});

export default store;
