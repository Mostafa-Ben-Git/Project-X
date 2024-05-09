import apiService from "@/api/apiService";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setFetching,
  setHasNextPage,
  setPage,
  setPosts,
} from "slices/postsSlice";
import useIntersectionObserver from "./useIntersectionObserver";
import { useState } from "react";

export default function usePost() {
  const dispatch = useDispatch();

  const { isFetching, posts, page, hasNextPage } = useSelector(
    (state) => state.posts,
  );

  const fetchPosts = async (pageNumber) => {
    dispatch(setFetching(true));
    try {
      const { data: postes } = await apiService.get(
        `api/posts?page=${pageNumber}`,
      );
      if (postes.meta.last_page <= page) dispatch(setHasNextPage(false));
      dispatch(setPosts(postes.data));
    } catch (error) {
      const responseData = error.response;
      console.error("Error fetching posts", responseData);
    } finally {
      dispatch(setFetching(false));
    }
  };

  const lastPostRef = useIntersectionObserver(() => {
    console.log(hasNextPage);
    dispatch(setPage());
  }, [!isFetching, hasNextPage]);

  return { isFetching, posts, fetchPosts, page, lastPostRef, hasNextPage };
}
