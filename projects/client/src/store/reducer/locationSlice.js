import { createSlice } from "@reduxjs/toolkit";

export const locationSlice = createSlice({
  name: "location",
  initialState: { outOfReach: "" },
  reducers: {
    keepLocation: (state, action) => {
      state.outOfReach = action.payload;
    },
    clearLocation: (state) => {
      state.outOfReach = "";
    },
  },
});

export const { keepLocation, clearLocation } = locationSlice.actions;

export default locationSlice.reducer;
