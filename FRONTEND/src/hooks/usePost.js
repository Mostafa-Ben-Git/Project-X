import apiService from "@/api/apiService";
import { useDispatch, useSelector } from "react-redux";
import {
  setFetching,
  setHasNextPage,
  setNewPost,
  setPage,
  setPosts,
} from "slices/postsSlice";
import useIntersectionObserver from "./useIntersectionObserver";

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
    dispatch(setPage());
  }, [!isFetching, hasNextPage]);

  const addPost = async (post) => {
    // dispatch(setPosts([post, ...posts]));
    try {
      dispatch(setFetching(true));
      const { data } = await apiService.post("api/posts", post);
      dispatch(setNewPost(data));
    } catch (error) {
      const responseData = error.response;
      console.error("Error adding post", responseData);
    }
    finally {
      dispatch(setFetching(false));
    } 
  };

  return {
    isFetching,
    posts,
    fetchPosts,
    page,
    lastPostRef,
    hasNextPage,
    addPost,
  };
}
