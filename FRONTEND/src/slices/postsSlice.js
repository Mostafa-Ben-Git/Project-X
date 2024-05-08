// create postes slice to fectch posts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiService from "../api/apiService";

// async thunk middleware to fetch posts from api /posts
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  try {
    const { data } = await apiService.get("/posts");
    return data;
  } catch (error) {
    console.error(error);
  }
});

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
    isLoading: false,
    status: "idle",
    errors: {},
  },
  reducers: {
    setPosts(state, action) {
      state.posts = action.payload;
    },
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setErrors(state, action) {
      state.errors = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.status = "pending";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
        console.log(state.posts);
        state.isLoading = false;
        state.status = "fulfilled";
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.status = "rejected";
        state.errors = action.error;
      });
  },
});

export const { setPosts, setIsLoading, setStatus, setErrors } =
  postsSlice.actions;

export default postsSlice.reducer;
