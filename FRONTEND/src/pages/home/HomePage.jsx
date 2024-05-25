import Post from "@/features/post/Post";
import PostBox from "@/features/post/PostBox";
import usePosts from "@/hooks/usePosts";

import { MoonLoader } from "react-spinners";

function HomePage() {
  const { isFetching, posts, lastPostRef, hasNextPage } = usePosts();

  return (
    <main className="p-8">
      {!isFetching && <PostBox className="rounded-sm p-2"/>}
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {posts?.map((post, i, posts) => (
          <Post
            {...post}
            postData={post}
            key={`post-${post.post_id}-${Math.random()}`}
            className="cursor-pointer rounded-md border"
            innerRef={posts.length - 1 === i ? lastPostRef : undefined}
          />
        ))}
        {isFetching && (
          <div className=" flex w-full items-center justify-center rounded-lg bg-slate-400 p-5">
            <MoonLoader color="#ffffff" size={30} />
          </div>
        )}
        {!hasNextPage && <p>No more posts</p>}
      </ul>
    </main>
  );
}

export default HomePage;
