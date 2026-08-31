import { useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import LoaderCircle from "@/components/LoaderCircle";
import Post from "@/features/post/Post";
import { fetchBookmarks } from "@/api/posts";

function BookmarksPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["bookmarks"],
    queryFn: ({ pageParam = 1 }) => fetchBookmarks({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });

  const posts = data?.pages.flatMap((p) => p.data) ?? [];
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage) fetchNextPage();
      },
      { rootMargin: "300px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, data?.pages?.length]);

  return (
    <main className="w-full px-2 sm:px-4">
      <div className="mx-auto flex w-full max-w-[600px] flex-col">
        <div className="flex items-center gap-2 border-b border-border px-2 py-3 sm:px-4">
          <Bookmark className="h-5 w-5" />
          <h1 className="text-lg font-bold">Bookmarks</h1>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-10" role="status" aria-label="Loading bookmarks">
            <LoaderCircle />
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Bookmark className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No bookmarks yet</p>
            <p className="text-sm text-muted-foreground">Save posts to find them again later.</p>
          </div>
        )}

        {!isLoading && posts.length > 0 && (
          <ul className="flex flex-col divide-y divide-border">
            {posts.map((post, i) => (
              <Post
                {...post}
                postData={post}
                key={`bookmark-${post.post_id}`}
                innerRef={i === posts.length - 1 ? sentinelRef : undefined}
              />
            ))}
          </ul>
        )}

        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-6" role="status" aria-label="Loading more bookmarks">
            <LoaderCircle />
          </div>
        )}

        {!hasNextPage && !isLoading && posts.length > 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">You&apos;re all caught up</p>
        )}
      </div>
    </main>
  );
}

export default BookmarksPage;
