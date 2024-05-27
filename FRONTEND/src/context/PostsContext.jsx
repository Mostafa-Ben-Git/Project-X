import { createContext, useEffect, useRef, useState } from "react";

import apiService from "@/api/apiService"; // Assuming you have an API service
import useIntersectionObserver from "@/hooks/useIntersectionObserver";

export const PostsContext = createContext();

function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const [currentPost, setCurrentPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(1);
  const [isFetchingComments, setIsFetchingComments] = useState(false);

  const [errors, setErrors] = useState({});
  const [scrollPosition, setScrollPosition] = useState(0);

  const homePageRef = useRef(null);

  async function fetchPosts(pageNumber = page) {
    setIsFetching(true);
    try {
      const { data: postes } = await apiService.get(
        `api/posts?page=${pageNumber}`,
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
      if (data.parent_id) {
        setComments((prevPosts) => [data, ...prevPosts]);
      } else {
        setPosts((prevPosts) => [data, ...prevPosts]);
      }
    } catch (error) {
      const responseData = error.response;
      console.error("Error adding post", responseData);
      setErrors(responseData);
    } finally {
      setIsPosting(false);
    }
  };

  const deletePost = async (post_id) => {
    try {
      await apiService.delete(`api/posts/${post_id}`);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== post_id));
    } catch (error) {
      const responseData = error.response;
      console.error("Error deleting post", responseData);
      setErrors(responseData);
    }
  };

  const fetchComments = async (post_id, pageComment) => {
    if (pageComment === null) return;
    try {
      setIsFetchingComments(true);
      const res = await apiService.get(
        `api/posts/${post_id}/comments?page=${pageComment}`,
      );
      if (res.status === 200) {
        const data = res.data;
        if (data.data.length > 0) {
          setCommentPage((prevPage) => prevPage + 1);
          setComments((prevComments) => [...prevComments, ...data.data]);
        } else {
          setCommentPage(null);
        }
      } else {
        setCommentPage(null);
      }
    } catch (error) {
      const responseData = error.response;
      console.error("Error fetching comments", responseData);
    } finally {
      setIsFetchingComments(false);
    }
  };

  const fetchPostByUsernameAndId = async (username, post_id) => {
    try {
      const { data } = await apiService.get(`api/${username}/post/${post_id}`);
      return data;
    } catch (error) {
      const responseData = error.response;
      console.error("Error fetching post", responseData);
      setErrors(responseData);
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
    deletePost,
    fetchComments,
    isFetchingComments,
    setScrollPosition,
    fetchPostByUsernameAndId,
    scrollPosition,
    homePageRef,
    likingHandler,
    setComments,
    commentPage,
    setCommentPage,
    isFetching,
    currentPost,
    posts,
    setPosts, // Setter for posts
    fetchPosts,
    page,
    setPage, // Setter for page
    lastPostRef,
    hasNextPage,
    isPosting,
    setIsPosting,
    addPost,
    comments,
    setCurrentPost,
    errors,
    setErrors, // Setter for errors
  };

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
}

export { PostsProvider };
