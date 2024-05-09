// create postes slice to fectch posts
import { createSlice } from "@reduxjs/toolkit";

// async thunk middleware to fetch posts from api /posts

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
    page: 1,
    hasNextPage: true,
    isFetching: false,
    status: "idle",
    errors: {},
  },
  reducers: {
    setPosts(state, action) {
      state.posts = [...state.posts, ...action.payload];
    },
    setFetching(state, action) {
      state.isFetching = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setPage(state) {
      state.page++;
    },
    setErrors(state, action) {
      state.errors = action.payload;
    },
    setHasNextPage(state, action) {
      state.hasNextPage = action.payload;
    },
  },
});

export const {
  setPosts,
  setFetching,
  setStatus,
  setErrors,
  setPage,
  setHasNextPage,
} = postsSlice.actions;

export default postsSlice.reducer;
