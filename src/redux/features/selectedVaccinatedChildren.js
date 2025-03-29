import { createSlice } from "@reduxjs/toolkit";

export const selectedVaccinatedChildrenSlice = createSlice({
  name: "selectedVaccinatedChildren",
  initialState: {
    selectedChild: null,
  },
  reducers: {
    setSelectedVaccinatedChild: (state, action) => {
      state.selectedChild = action.payload;
    },
    clearSelectedVaccinatedChild: (state) => {
      state.selectedChild = null;
    },
  },
});

export const { setSelectedVaccinatedChild, clearSelectedVaccinatedChild } = selectedVaccinatedChildrenSlice.actions;
export default selectedVaccinatedChildrenSlice.reducer;
