import { createSlice } from "@reduxjs/toolkit";

export const childrenSelectedSlice = createSlice({
  name: "selectedChild",
  initialState: {
    selectedChild: null,
  },
  reducers: {
    setSelectedChild: (state, action) => {
      state.selectedChild = action.payload;
    },
    clearSelectedChild: (state) => {
      state.selectedChild = null;
    },
  },
});

export const { setSelectedChild, clearSelectedChild } = childrenSelectedSlice.actions;
export default childrenSelectedSlice.reducer;
