import LoaderCircle from "@/components/LoaderCircle";
import Post from "@/features/post/Post";
import PostBox from "@/features/post/PostBox";
import usePosts from "@/hooks/usePosts";
import { useEffect } from "react";

function HomePage() {
  const { isFetching, posts, lastPostRef, hasNextPage } = usePosts();

  function getScrollPosition() {
    return window.scrollY;
  }

  useEffect(() => {
    window.addEventListener("scroll", getScrollPosition);
    return () => {
      window.removeEventListener("scroll", getScrollPosition);
    };
  }, []);

  return (
    <main className="p-2">
      <ul className="mt-4 flex flex-wrap justify-center gap-4">
        {!isFetching && <PostBox className="rounded-sm p-2" />}
        {posts?.map((post, i, posts) => (
          <Post
            {...post}
            postData={post}
            key={`post-${post.post_id}-${Math.random()}`}
            className="cursor-pointer rounded-md border"
            innerRef={posts.length - 1 === i ? lastPostRef : undefined}
          />
        ))}
        {isFetching && <LoaderCircle />}
        {!hasNextPage && <p>No more posts</p>}
      </ul>
    </main>
  );
}

export default HomePage;
