import { configureStore } from "@reduxjs/toolkit";
import auth from "./reducer/authSlice";
import cart from "./reducer/cartSlice";

export const store = configureStore({
  reducer: { auth, cart },
});

export default store;
