import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiService from "../api/apiService";

export const validateLogin = createAsyncThunk("login", async (data) => {
  apiService
    .post("/login", data)
    .then((res) => console.log(res))
    .catch((e) => {
      throw e;
    });
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    status: "",
    errors: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(validateLogin.pending, (state) => {
        state.status = "loading";
      })
      .addCase(validateLogin.fulfilled, (state, action) => {
        state.data = action.payload;
        state.status = "succes";
      })
      .addCase(validateLogin.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default authSlice.reducer;
