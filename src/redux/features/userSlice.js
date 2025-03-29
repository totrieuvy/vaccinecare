import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    login: (state, actions) => {
      state = actions.payload;
      return state;
    },

    logout: () => {
      return null;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
