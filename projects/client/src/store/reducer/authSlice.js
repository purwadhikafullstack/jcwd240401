import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: { profile: {} },
  reducers: {
    keep(state, action) {
      state.profile = action.payload;
    },

    remove(state) {
      state.profile = {};
    },
  },
});

export const { keep, remove } = authSlice.actions;

export default authSlice.reducer;
