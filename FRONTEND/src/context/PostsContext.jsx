import { createContext, useEffect, useState } from "react";

import apiService from "@/api/apiService"; // Assuming you have an API service
import useIntersectionObserver from "@/hooks/useIntersectionObserver";

export const PostsContext = createContext();

function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ text: "", images: [] });
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState({});

  async function fetchPosts(pageNumber) {
    setIsFetching(true);
    try {
      const { data: postes } = await apiService.get(
        `api/posts?page=${pageNumber}`,
      );
      if (postes.meta.last_page <= page) setHasNextPage(false);
      setPosts((prevPosts) => [...prevPosts, ...postes.data]);
    } catch (error) {
      const responseData = error.response;
      console.error("Error fetching posts", responseData);
      setErrors(responseData);
    } finally {
      setIsFetching(false);
    }
  }

  const lastPostRef = useIntersectionObserver(() => {
    setPage((prevPage) => prevPage + 1);
  }, [!isFetching, hasNextPage]);

  const addPost = async (post) => {
    try {
      setIsFetching(true);
      const { data } = await apiService.post("api/posts", post);
      setNewPost(data);
      setPosts((prevPosts) => [data, ...prevPosts]);
    } catch (error) {
      const responseData = error.response;
      console.error("Error adding post", responseData);
      setErrors(responseData);
    } finally {
      setIsFetching(false);
    }
  };

  const value = {
    isFetching,
    posts,
    newPost,
    setNewPost,
    setPosts, // Setter for posts
    fetchPosts,
    page,
    setPage, // Setter for page
    lastPostRef,
    hasNextPage,
    addPost,
    status,
    setStatus, // Setter for status
    errors,
    setErrors, // Setter for errors
  };

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
}

export { PostsProvider };
