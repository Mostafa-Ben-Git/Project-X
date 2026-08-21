import LoaderCircle from "@/components/LoaderCircle";
import Post from "@/features/post/Post";
import PostBox from "@/features/post/PostBox";
import useAuth from "@/hooks/useAuth";
import { getPost, fetchPostComments } from "@/api/posts";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRef, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

function PostPage() {
  const { username, post_id } = useParams();
  const { state } = useLocation();
  const { user, getUser } = useAuth();
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!user) getUser();
  }, [user, getUser]);

  // Fetch the single post (only after auth is ready)
  const postQuery = useQuery({
    queryKey: ["post", username, post_id],
    queryFn: () => getPost(username, post_id),
    enabled: !!username && !!post_id && !!user,
  });

  // Fetch comments as infinite query
  const commentsQuery = useInfiniteQuery({
    queryKey: ["comments", post_id],
    queryFn: ({ pageParam = 1 }) => fetchPostComments(post_id, { pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.current_page < last.meta.last_page
        ? last.meta.current_page + 1
        : undefined,
    enabled: !!post_id,
  });

  const currentPost = state?.postData || postQuery.data?.data;
  const comments = commentsQuery.data?.pages.flatMap((p) => p.data) ?? [];

  // Auto-load next page of comments on scroll
  useEffect(() => {
    if (!sentinelRef.current || !commentsQuery.hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
          commentsQuery.fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments, commentsQuery.hasNextPage, commentsQuery.isFetchingNextPage, commentsQuery.fetchNextPage]);

  // Show loading while auth is initializing
  if (!user && !postQuery.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoaderCircle />
      </div>
    );
  }

  if (postQuery.isLoading && !currentPost) {
    return (
      <div className="flex justify-center py-20">
        <LoaderCircle />
      </div>
    );
  }

  if (postQuery.isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-lg font-semibold">Post not found</p>
        <p className="text-sm text-muted-foreground">The post may have been deleted.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="sticky top-0 z-10 flex items-center gap-2 bg-background/80 px-4 py-2 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => window.history.go(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-xl font-bold">Post</span>
      </header>

      <section>
        {currentPost && currentPost.user && (
          <Post
            {...currentPost}
            postData={currentPost}
            className="border-b"
            clickable={false}
          />
        )}
      </section>

      <section className="px-4 py-3">
        <PostBox parent_id={post_id} isReplay={true} />
      </section>

      <section>
        <ul>
          {comments.map((comment) => (
            <Post
              {...comment}
              key={`comment-${comment.post_id}`}
              postData={comment}
              className="border-b"
              type="replay"
              clickable={false}
            />
          ))}
        </ul>

        {commentsQuery.hasNextPage && (
          <div ref={sentinelRef} className="flex justify-center py-6">
            {commentsQuery.isFetchingNextPage && <LoaderCircle />}
          </div>
        )}

        {!commentsQuery.hasNextPage && comments.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No comments yet</p>
        )}

        {!commentsQuery.hasNextPage && comments.length > 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">You&apos;ve reached the end</p>
        )}
      </section>
    </div>
  );
}

export default PostPage;
