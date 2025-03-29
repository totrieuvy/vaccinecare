import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedChild: null,
};

export const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    setSelectedChildByDoctor: (state, action) => {
      state.selectedChild = action.payload;
    },
    clearSelectedChildByDoctor: (state) => {
      state.selectedChild = null;
    },
  },
});

export const { setSelectedChildByDoctor, clearSelectedChildByDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;
