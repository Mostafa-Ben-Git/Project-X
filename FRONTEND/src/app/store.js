import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import postsReducer from "../slices/postsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
  },
});

export default store;
