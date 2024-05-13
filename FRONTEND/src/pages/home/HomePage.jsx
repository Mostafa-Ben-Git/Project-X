import Post from "@/features/post/Post";
import PostBox from "@/features/post/PostBox";
import usePost from "@/hooks/usePost";
import { MoonLoader } from "react-spinners";

function HomePage() {
  const { isFetching, posts, lastPostRef, hasNextPage } = usePost();

  return (
    <main>
      <PostBox />
      <ul className="flex flex-wrap justify-center gap-4">
        {posts?.map((post, i, posts) => (
          <Post
            {...post}
            key={`post-${post.post_id}-${Math.random()}`}
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
