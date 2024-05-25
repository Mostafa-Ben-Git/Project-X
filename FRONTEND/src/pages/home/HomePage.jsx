import LoaderCircle from "@/components/LoaderCircle";
import Post from "@/features/post/Post";
import PostBox from "@/features/post/PostBox";
import usePosts from "@/hooks/usePosts";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect, useRef, useState } from "react";

function HomePage() {
  const { isFetching, posts, lastPostRef, hasNextPage } = usePosts();
  // TODO: implement store scrolling
  // const scrollRef = useRef(null);

  // function getScrollPosition() {
  //   return scrollRef.current?.clientHeight;
  // }

  // const [scrollYStorage, setScrollYStorage] = useLocalStorage(
  //   "scrollYStorage",
  //   0,
  // );
  // const [scrollY, setScrollY] = useState(0);

  // useEffect(() => {
  //   // if the setcondition is true (AKA everything in the DOM is loaded: fire off the scrollTo()!)
  //   if (!isFetching) {
  //     window.scrollTo(0, scrollYStorage);
  //   }
  // }, [isFetching, scrollYStorage]);

  // useEffect(() => {
  //   return () => {
  //     console.log(window.scrollY);
  //     // setScrollYStorage(scrollRef.current?.scrollTop);
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <main className="p-8">
      {!isFetching && <PostBox className="rounded-sm p-2" />}
      <ul className="mt-4 flex flex-wrap justify-center gap-4">
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
