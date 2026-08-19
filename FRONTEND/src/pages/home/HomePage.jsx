import { useRef, useEffect } from "react";
import LoaderCircle from "@/components/LoaderCircle";
import Post from "@/features/post/Post";
import PostBox from "@/features/post/PostBox";
import { useFeed } from "@/hooks/useFeed";

function HomePage() {
  const {
    posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useFeed();

  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      },
      { rootMargin: "300px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [posts, hasNextPage, fetchNextPage]);

  return (
    <main className="w-full p-2">
      <div className="mx-auto flex max-w-2xl flex-col gap-3">
        <PostBox className="rounded-md border p-2" />

        {isLoading && (
          <div className="flex justify-center py-6">
            <LoaderCircle />
          </div>
        )}

        {!isLoading &&
          posts?.map((post, i) => (
            <Post
              {...post}
              postData={post}
              key={`post-${post.post_id}`}
              className="cursor-pointer rounded-md border"
              innerRef={i === posts.length - 1 ? sentinelRef : undefined}
            />
          ))}

        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <LoaderCircle />
          </div>
        )}

        {!hasNextPage && !isLoading && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No more posts
          </p>
        )}
      </div>
    </main>
  );
}

export default HomePage;
