import { createSlice } from "@reduxjs/toolkit";

export const locationSlice = createSlice({
  name: "location",
  initialState: { location: "" },
  reducers: {
    keepLocation: (state, action) => {
      state.location = action.payload;
    },
    clearLocation: (state) => {
      state.location = "";
    },
  },
});

export const { keepLocation, clearLocation } = locationSlice.actions;

export default locationSlice.reducer;
