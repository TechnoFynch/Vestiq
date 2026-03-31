import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: "",
    name: "",
    role: "",
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload.token;
      state.name = action.payload.name;
      state.role = action.payload.role;
    },
    removeToken: (state) => {
      state.token = "";
      state.name = "";
      state.role = "";
    },
  },
});

export const { setToken, removeToken } = authSlice.actions;

export default authSlice.reducer;
