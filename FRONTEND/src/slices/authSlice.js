import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiService from "../api/apiService";

//TODO
// export const validate = createAsyncThunk("validate", async (url, reqData) => {
//   try {
//     const res = await apiService.post(`/api/${url}`, reqData);
//     if (res.status === 200) {
//       localStorage.setItem("token", res.data.token);
//     }
//     return res;
//   } catch (error) {
//     const response = error.response;
//     if (response && response.status === 422) {
//       return response;
//     }
//   }
// });

export const validateLogin = createAsyncThunk("login", async (data) => {
  try {
    const res = await apiService.post("/api/login", data);
    if (res.status === 200) {
      localStorage.setItem("token", res.data.token);
    }
    return res;
  } catch (error) {
    const response = error.response;
    if (response && response.status === 422) {
      return response;
    }
  }
});

export const validateRegister = createAsyncThunk("register", async (data) => {
  try {
    const res = await apiService.post("/api/signup", data);
    if (res.status === 200) {
      localStorage.setItem("token", res.data.token);
    }
    return res;
  } catch (error) {
    const response = error.response;
    if (response && response.status === 422) {
      return response;
    }
  }
});

export const getUser = createAsyncThunk("user", async () => {
  try {
    const res = await apiService.get("/api/user");
    // await apiService.get("/sanctum/csrf-cookie");
    if (res.status === 200) {
      return res.data;
    }
    return res;
  } catch (error) {
    const response = error.response;
    if (response && response.status === 422) {
      return response.data;
    }
  }
});

export const logout = createAsyncThunk("logout", async () => {
  try {
    const res = await apiService.post("/api/logout");
    if (res.status === 204) {
      localStorage.removeItem("token");
    }
    return res;
  } catch (error) {
    const response = error.response;
    if (response && response.status === 422) {
      return response.data;
    }
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: "",
    isLoading: false,
    status: "",
    info: {},
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setToken(state, action) {
      state.token = action.payload;
    },
    setLaoding(state, action) {
      state.isLoading = action.payload;
    },
    setInfo(state, action) {
      state.info = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(validateLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data?.user;
        state.token = action.payload.data?.token;
        state.info = action.payload.data;
      })
      .addCase(validateLogin.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(validateRegister.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(validateRegister.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data?.user;
        state.token = action.payload.data?.token;
        state.info = action.payload.data;
      })
      .addCase(validateRegister.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(logout.pending, (state) => {
        state.status = "logout";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = {};
      })
      .addCase(logout.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { setToken, setUser, setLaoding, setInfo } = authSlice.actions;

export default authSlice.reducer;
