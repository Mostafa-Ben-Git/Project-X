import { createContext, useEffect, useRef, useState } from "react";

import apiService from "@/api/apiService"; // Assuming you have an API service
import useIntersectionObserver from "@/hooks/useIntersectionObserver";

export const PostsContext = createContext();

function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ text: "", images: [] });
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [status, setStatus] = useState("idle");
  const [currentPost, setCurrentPost] = useState(null);
  const [commentPage, setCommentPage] = useState(1);

  const [errors, setErrors] = useState({});
  const [scrollPosition, setScrollPosition] = useState(0);
  const homePageRef = useRef(null);

  async function fetchPosts(pageNumber = page) {
    setIsFetching(true);
    try {
      const { data: postes } = await apiService.get(
        `api/posts?page=${pageNumber}`,
        {},
      );
      setPage((prevPage) => prevPage + 1);
      if (postes.meta.last_page <= page) setHasNextPage(false);
      else setPosts((prevPosts) => [...prevPosts, ...postes.data]);
    } catch (error) {
      const responseData = error.response;
      console.error("Error fetching posts", responseData);
      setErrors(responseData);
    } finally {
      setIsFetching(false);
    }
  }

  const lastPostRef = useIntersectionObserver(() => {
    fetchPosts(page);
  }, [!isFetching, hasNextPage]);

  const addPost = async (post) => {
    try {
      setIsPosting(true);
      const { data } = await apiService.post("api/posts", post);
      setNewPost(data);
      setPosts((prevPosts) => [data, ...prevPosts]);
    } catch (error) {
      const responseData = error.response;
      console.error("Error adding post", responseData);
      setErrors(responseData);
    } finally {
      setIsPosting(false);
    }
  };

  const getPostByUsername = async (username, post_id) => {
    setIsFetching(true);
    try {
      const { data } = await apiService.get(
        `api/${username}/posts/${post_id}$page=${commentPage}`,
      );
      if (commentPage === 1) {
        setCurrentPost(data);
      } else {
        setCurrentPost((prevPost) => ({
          ...prevPost,
          comments: [...prevPost.comments, ...data.comments],
        }));
      }
    } catch (error) {
      const responseData = error.response;
      console.error("Error fetching posts", responseData);
    } finally {
      setIsFetching(false);
    }
  };

  const likingHandler = async (post_id) => {
    try {
      await apiService.post(`api/posts/${post_id}/changeLikeStatus`);
    } catch (error) {
      const responseData = error.response;
      console.error("Error adding post", responseData);
      setErrors(responseData);
    } 
  };

  const value = {
    setScrollPosition,
    scrollPosition,
    homePageRef,
    getPostByUsername,
    likingHandler,
    isFetching,
    currentPost,
    posts,
    newPost,
    setNewPost,
    setPosts, // Setter for posts
    fetchPosts,
    page,
    setPage, // Setter for page
    lastPostRef,
    hasNextPage,
    isPosting,
    setIsPosting,
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
