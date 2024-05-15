import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    posts:[],
    token: "",
    isLoading: false,
    status: "idle",
    errors: {},
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setToken(state, action) {
      state.token = action.payload;
    },
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },
    setErrors(state, action) {
      state.errors = action.payload;
    },
    setPosts(state, action) { 
      state.posts = action.payload;
    },
  },
});

export const { setToken, setUser,setPosts, setIsLoading, setErrors } = authSlice.actions;

export default authSlice.reducer;
