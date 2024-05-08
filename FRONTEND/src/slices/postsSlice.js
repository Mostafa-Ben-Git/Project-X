// create postes slice to fectch posts
import { createSlice } from "@reduxjs/toolkit";
import { apiService } from "../api/apiService";

// async thunk middleware to fetch posts from api /posts

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
});

export const postsActions = postsSlice.actions;
export default postsSlice.reducer;