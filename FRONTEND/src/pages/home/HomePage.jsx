import { useRef, useEffect } from "react";
import LoaderCircle from "@/components/LoaderCircle";
import Post from "@/features/post/Post";
import PostBox from "@/features/post/PostBox";
import { useFeed } from "@/hooks/useFeed";

function HomePage() {
  const { posts, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useFeed();

  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage) fetchNextPage();
      },
      { rootMargin: "300px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [posts, hasNextPage, fetchNextPage]);

  return (
    <main className="w-full">
      <div className="flex w-full flex-col">
        <PostBox />

        {isLoading && (
          <div
            className="flex items-center justify-center py-10"
            role="status"
            aria-label="Loading posts"
          >
            <LoaderCircle />
          </div>
        )}

        {!isLoading && posts?.length === 0 && (
          <div className="flex flex-col items-center gap-1 py-16 text-center">
            <p className="text-sm font-medium text-foreground">
              No posts yet
            </p>
            <p className="text-sm text-muted-foreground">
              Posts from people you follow will show up here.
            </p>
          </div>
        )}

        {!isLoading && posts?.length > 0 && (
          <ul className="flex flex-col divide-y divide-border">
            {posts.map((post, i) => (
              <Post
                {...post}
                postData={post}
                key={`post-${post.post_id}`}
                innerRef={i === posts.length - 1 ? sentinelRef : undefined}
              />
            ))}
          </ul>
        )}

        {isFetchingNextPage && (
          <div
            className="flex items-center justify-center py-6"
            role="status"
            aria-label="Loading more posts"
          >
            <LoaderCircle />
          </div>
        )}

        {!hasNextPage && !isLoading && posts?.length > 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
              You&apos;re all caught up
          </p>
        )}
      </div>
    </main>
  );
}

export default HomePage;