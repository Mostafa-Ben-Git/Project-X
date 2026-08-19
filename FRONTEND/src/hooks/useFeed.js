import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/posts";

export function useFeed() {
  const qc = useQueryClient();

  const invalidateFeed = () => {
    qc.invalidateQueries({ queryKey: ["posts"] });
  };

  const posts = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => api.fetchPosts({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });

  const createPost = useMutation({
    mutationFn: api.createPost,
    onSuccess: () => {
      invalidateFeed();
      toast.success("Post published");
    },
    onError: () => toast.error("Failed to publish post"),
  });

  const editPost = useMutation({
    mutationFn: ({ id, payload }) => api.updatePost(id, payload),
    onSuccess: () => {
      invalidateFeed();
      toast.success("Post updated");
    },
    onError: () => toast.error("Failed to update post"),
  });

  const removePost = useMutation({
    mutationFn: api.deletePost,
    onSuccess: () => {
      invalidateFeed();
      toast.success("Post deleted");
    },
    onError: () => toast.error("Failed to delete post"),
  });

  const like = useMutation({
    mutationFn: api.toggleLike,
    // optimistic toggle handled in UI via local state
  });

  const allPosts = posts.data?.pages.flatMap((p) => p.data) ?? [];

  return {
    posts: allPosts,
    fetchNextPage: posts.fetchNextPage,
    hasNextPage: posts.hasNextPage,
    isFetchingNextPage: posts.isFetchingNextPage,
    isLoading: posts.isLoading,
    isError: posts.isError,
    error: posts.error,
    createPost,
    editPost,
    removePost,
    like,
  };
}
