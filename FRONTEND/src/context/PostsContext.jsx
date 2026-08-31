/* eslint-disable react-refresh/only-export-components */
import { createContext, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import apiService from "@/api/apiService"; // Assuming you have an API service
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { toast } from "sonner";

export const PostsContext = createContext();

function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const [currentPost, setCurrentPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(1);
  const [isFetchingComments, setIsFetchingComments] = useState(false);

  const [errors, setErrors] = useState({});
  const [scrollPosition, setScrollPosition] = useState(0);

  const qc = useQueryClient();

  const homePageRef = useRef(null);

  async function fetchPosts(pageNumber = page) {
    setIsFetching(true);
    try {
      const { data: postes } = await apiService.get(
        `/api/posts?page=${pageNumber}`,
        {},
      );
      setPage((prevPage) => prevPage + 1);
      if (postes.meta.last_page <= pageNumber) setHasNextPage(false);
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
      const { data } = await apiService.post("/api/posts", post);
      if (data.parent_id) {
        setComments((prevPosts) => [data, ...prevPosts]);
        incrementCommentsInCaches(data.parent_id);
        qc.invalidateQueries({ queryKey: ["comments", data.parent_id] });
      } else {
        setPosts((prevPosts) => [data, ...prevPosts]);
      }
      // keep feed counts in sync without waiting for refetch
      if (data.parent_id) {
        qc.invalidateQueries({ queryKey: ["post"] });
      }
    } catch (error) {
      const responseData = error.response;
      console.error("Error adding post", responseData);
      setErrors(responseData);
    } finally {
      setIsPosting(false);
    }
  };

  // Optimistically remove a post from any infinite-query cache (feed + profile tabs)
  const removeFromInfiniteCaches = (key, id) => {
    qc.setQueriesData({ queryKey: key }, (old) => {
      if (!old?.pages) return old;
      let changed = false;
      const pages = old.pages.map((p) => {
        if (!Array.isArray(p.data)) return p;
        const data = p.data.filter((x) => x.post_id !== id);
        if (data.length !== p.data.length) changed = true;
        return { ...p, data };
      });
      return changed ? { ...old, pages } : old;
    });
  };

  // Optimistically update a post inside any infinite-query cache
  const updateInInfiniteCaches = (key, id, updater) => {
    qc.setQueriesData({ queryKey: key }, (old) => {
      if (!old?.pages) return old;
      let changed = false;
      const pages = old.pages.map((p) => {
        if (!Array.isArray(p.data)) return p;
        const data = p.data.map((x) => {
          if (x.post_id === id) {
            changed = true;
            return updater(x);
          }
          return x;
        });
        return { ...p, data };
      });
      return changed ? { ...old, pages } : old;
    });
  };

  const deletePost = async (post_id) => {
    const previousPosts = posts;
    // Optimistic: hide the post everywhere immediately
    setPosts((prevPosts) => prevPosts.filter((post) => post.post_id !== post_id));
    removeFromInfiniteCaches(["posts"], post_id);
    removeFromInfiniteCaches(["profile"], post_id);
    setIsDeleting(true);

    try {
      await apiService.delete(`/api/posts/${post_id}`);
      toast.success("Post deleted successfully");
      // Re-sync server truth (counts, ordering) after the optimistic removal
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["user-posts-count"] });
    } catch (error) {
      // Rollback on error
      setPosts(previousPosts);
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      const responseData = error.response;
      console.error("Error deleting post", responseData);
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const editPost = async (post_id, payload) => {
    const previousPosts = posts;
    // Pull the new content for an immediate optimistic preview
    const optimisticContent = payload?.get ? payload.get("content") : (payload?.content ?? "");
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.post_id === post_id ? { ...p, content: optimisticContent } : p)),
    );
    updateInInfiniteCaches(["posts"], post_id, (x) => ({ ...x, content: optimisticContent }));
    updateInInfiniteCaches(["profile"], post_id, (x) => ({ ...x, content: optimisticContent }));

    try {
      const { data } = await apiService.post(`/api/post/${post_id}/update`, payload);
      const updated = data?.data ?? data;
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.post_id === post_id ? { ...p, ...updated } : p)),
      );
      updateInInfiniteCaches(["posts"], post_id, () => updated);
      updateInInfiniteCaches(["profile"], post_id, () => updated);
      qc.setQueriesData({ queryKey: ["post"] }, (old) => {
        if (old?.data && old.data.post_id === post_id) {
          return { ...old, data: { ...old.data, ...updated } };
        }
        return old;
      });
      toast.success("Post edited successfully");
    } catch (error) {
      setPosts(previousPosts);
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["post"] });
      const responseData = error.response;
      console.error("Error editing post", responseData);
      toast.error("Failed to edit post");
    }
  };

  const fetchComments = async (post_id, pageComment) => {
    if (pageComment === null) return;
    try {
      setIsFetchingComments(true);
      const res = await apiService.get(
        `/api/posts/${post_id}/comments?page=${pageComment}`,
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

  const toggleLikeInCaches = (postId) => {
    const patch = (post) => {
      if (!post || post.post_id !== postId) return post;
      const wasLiked = !!(post.info?.is_liked ?? post.is_liked);
      const likes = post.info?.likes ?? post.likes ?? 0;
      const nextLiked = !wasLiked;
      const nextLikes = Math.max(0, likes + (nextLiked ? 1 : -1));
      return {
        ...post,
        info: { ...post.info, is_liked: nextLiked, likes: nextLikes },
        is_liked: nextLiked,
        likes: nextLikes,
      };
    };

    setPosts((prev) => prev.map((p) => (p.post_id === postId ? patch(p) : p)));

    qc.setQueriesData({ predicate: (q) => ["posts", "profile", "comments"].includes(q.queryKey[0]) }, (old) => {
      if (!old?.pages) return old;
      let changed = false;
      const pages = old.pages.map((page) => {
        if (!Array.isArray(page.data)) return page;
        const data = page.data.map((p) => {
          if (p.post_id === postId) {
            changed = true;
            return patch(p);
          }
          return p;
        });
        return changed ? { ...page, data } : page;
      });
      return changed ? { ...old, pages } : old;
    });

    qc.setQueriesData({ queryKey: ["post"] }, (old) => {
      if (!old?.data || old.data.post_id !== postId) return old;
      return { ...old, data: patch(old.data) };
    });
  };

  const likingHandler = async (post_id) => {
    toggleLikeInCaches(post_id);
    try {
      await apiService.post(`/api/posts/${post_id}/changeLikeStatus`);
      // keep optimistic state, just ensure server truth eventually
      qc.invalidateQueries({ queryKey: ["post"] });
      return true;
    } catch (error) {
      toggleLikeInCaches(post_id);
      const responseData = error.response;
      console.error("Error adding post", responseData);
      setErrors(responseData);
      return false;
    }
  };

  function patchPost(post, postId, updater) {
    if (!post || post.post_id !== postId) return post;
    return updater(post);
  }

  function patchInCaches(postId, updater) {
    const wrapped = (post) => patchPost(post, postId, updater);
    setPosts((prev) => prev.map((p) => wrapped(p)));
    qc.setQueriesData({ predicate: (q) => ["posts", "profile", "comments"].includes(q.queryKey[0]) }, (old) => {
      if (!old?.pages) return old;
      let changed = false;
      const pages = old.pages.map((page) => {
        if (!Array.isArray(page.data)) return page;
        const data = page.data.map((p) => {
          if (p.post_id === postId) {
            changed = true;
            return wrapped(p);
          }
          return p;
        });
        return changed ? { ...page, data } : page;
      });
      return changed ? { ...old, pages } : old;
    });
    qc.setQueriesData({ queryKey: ["post"] }, (old) => {
      if (!old?.data || old.data.post_id !== postId) return old;
      return { ...old, data: wrapped(old.data) };
    });
  }

  function toggleRepostInCaches(postId) {
    patchInCaches(postId, (post) => {
      const was = !!(post.info?.is_reposted ?? post.is_reposted);
      const count = post.info?.reposts_count ?? post.reposts_count ?? 0;
      const next = !was;
      const nextCount = Math.max(0, count + (next ? 1 : -1));
      return {
        ...post,
        info: { ...post.info, is_reposted: next, reposts_count: nextCount },
        is_reposted: next,
        reposts_count: nextCount,
      };
    });
  }

  function toggleBookmarkInCaches(postId) {
    patchInCaches(postId, (post) => {
      const was = !!(post.info?.is_bookmarked ?? post.is_bookmarked);
      return {
        ...post,
        info: { ...post.info, is_bookmarked: !was },
        is_bookmarked: !was,
      };
    });
  }

  function incrementViewsInCaches(postId) {
    patchInCaches(postId, (post) => {
      const v = post.info?.views ?? post.views ?? 0;
      return { ...post, info: { ...post.info, views: v + 1 }, views: v + 1 };
    });
  }

  function incrementCommentsInCaches(postId) {
    patchInCaches(postId, (post) => {
      const c = post.info?.comments_count ?? post.comments_count ?? 0;
      return { ...post, info: { ...post.info, comments_count: c + 1 }, comments_count: c + 1 };
    });
  }

  const repostingHandler = async (post_id) => {
    toggleRepostInCaches(post_id);
    try {
      await apiService.post(`/api/posts/${post_id}/repost`);
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["user-reposts-count"] });
      qc.invalidateQueries({ queryKey: ["user-posts-count"] });
      qc.invalidateQueries({ queryKey: ["user-replies-count"] });
      qc.invalidateQueries({ queryKey: ["post"] });
      return true;
    } catch (error) {
      toggleRepostInCaches(post_id);
      const responseData = error.response;
      console.error("Error reposting post", responseData);
      setErrors(responseData);
      return false;
    }
  };

  const bookmarkHandler = async (post_id) => {
    toggleBookmarkInCaches(post_id);
    try {
      await apiService.post(`/api/posts/${post_id}/bookmark`);
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
      return true;
    } catch {
      toggleBookmarkInCaches(post_id);
      return false;
    }
  };

  const value = {
    isDeleting,
    setIsDeleting,
    editPost,
    deletePost,
    fetchComments,
    isFetchingComments,
    setScrollPosition,
    fetchPostByUsernameAndId,
    scrollPosition,
    homePageRef,
    likingHandler,
    repostingHandler,
    bookmarkHandler,
    incrementViewsInCaches,
    incrementCommentsInCaches,
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
